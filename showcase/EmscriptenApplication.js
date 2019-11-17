/*
    This file is part of Magnum.

    Copyright © 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018
              Vladimír Vondruš <mosra@centrum.cz>

    Permission is hereby granted, free of charge, to any person obtaining a
    copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included
    in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
    THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
    DEALINGS IN THE SOFTWARE.
*/

"use strict"; /* it summons the Cthulhu in a proper way, they say */

/* Patched version of the upstream Magnum driver code in order to support
   having extra files on another domain. Be careful when updating. The module
   <script> tag has to be *right before* this one for the following to work. */
var scripts = document.getElementsByTagName('script');
var moduleSrc = scripts[scripts.length - 2].src;
var moduleBaseDir = moduleSrc.substr(0, moduleSrc.lastIndexOf('/') + 1);

var Module = {
    preRun: [],
    postRun: [],

    arguments: [],

    printErr: function(message) {
        console.error(Array.prototype.slice.call(arguments).join(' '));
    },

    print: function(message) {
        console.log(Array.prototype.slice.call(arguments).join(' '));
    },

    locateFile: function(url) { return moduleBaseDir + url; },

    onAbort: function() {
        Module.canvas.style.opacity = 0.333;
        Module.canvas.style.zIndex = -1;
        Module.setStatus("Oops :(");
        Module.setStatusDescription("The app crashed. Refresh the page or check the browser console for details.");
    },

    canvas: document.getElementById('canvas'),

    setStatus: function(message) {
        var status = document.getElementById('status');
        /* Emscripten calls setStatus("") after a timeout even if the app
           aborts. That would erase the crash message, so don't allow that */
        if(status && status.innerHTML != "Oops :(")
            status.innerHTML = message;
    },

    setStatusDescription: function(message) {
        var statusDescription = document.getElementById('status-description');
        if(statusDescription) statusDescription.innerHTML = message;
    },

    totalDependencies: 0,

    monitorRunDependencies: function(left) {
        this.totalDependencies = Math.max(this.totalDependencies, left);

        if(left) {
            Module.setStatus('Downloading...');
            Module.setStatusDescription((this.totalDependencies - left) + ' / ' + this.totalDependencies);
        } else {
            Module.setStatus('Download complete');
            Module.setStatusDescription('');
        }
    }
};

/* Parse arguments, e.g. /app/?foo=bar&fizz&buzz=3 goes to the app as
   ['--foo', 'bar', '--fizz', '--buzz', '3'] */
var args = decodeURIComponent(window.location.search.substr(1)).trim().split('&');
for(var i = 0; i != args.length; ++i) {
    var j = args[i].indexOf('=');
    /* Key + value */
    if(j != -1) {
        Module.arguments.push('--' + args[i].substring(0, j));
        Module.arguments.push(args[i].substring(j + 1));

    /* Just key */
    } else Module.arguments.push('--' + args[i]);
}

Module.setStatus('Downloading...');

/* Capture keyboard only after a click. Capture it by default so I'm not
   getting reports of "stuff not working".  */
Module.keyboardListeningElement = Module.canvas;
Module.canvas.addEventListener('mousedown', function(event) {
    event.target.focus({preventScroll: true});
});
Module.canvas.focus({preventScroll: true});
