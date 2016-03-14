(function(window){

    /**
     * Since this is being run in a browser and the results should populate to an HTML page, require the HTML-specific Jasmine code, injecting the same reference.
     */
    jasmineRequire.html(jasmine);
    /**
     * Create the Jasmine environment. This is used to run all specs
     * in a project.
     */
    var env = jasmine.getEnv();

    /**
     * ## Runner Parameters
     *
     * More browser specific code - wrap the query string in an object and to allow for getting/setting parameters from the runner user interface.
     */

    var queryString = new jasmine.QueryString({
        getWindowLocation: function() { return window.location; }
    });

    var catchingExceptions = queryString.getParam("catch");
    env.catchExceptions(typeof catchingExceptions === "undefined" ? true : catchingExceptions);

    /**
     * ## Reporters
     * The `HtmlReporter` builds all of the HTML UI for the runner page. This reporter paints the dots, stars, and x's for specs, as well as all spec names and all failures (if any).
     */
    var htmlReporter = new jasmine.HtmlReporter({
        env: env,
        onRaiseExceptionsClick: function() { 
            queryString.setParam("catch", !env.catchingExceptions()); 
        },
        getContainer: function() { 
            return document.body; 
        },
        createElement: function() { 
            return document.createElement.apply(document, arguments); 
        },
        createTextNode: function() {
            return document.createTextNode.apply(document, arguments); 
        },

        jasmineDone: function() {
            var traces = document.querySelectorAll(".jasmine-stack-trace")
            for(var i = 0; i < traces.length; i++) {
                (function(node){
                    window.sourceMappedStackTrace.mapStackTrace(node.textContent, function(stack) {
                    node.textContent = node.previousSibling.textContent + "\n" + stack.join("\n")
                })
                })(traces[i])
            }
        },
        timer: new jasmine.Timer()
    });

    /**
     * The `jsApiReporter` also receives spec results, and is used by any environment that needs to extract the results  from JavaScript.
     */

    env.addReporter(htmlReporter);
    
   /*
    *   Will transform the stack traces using @novocaine's sourcemapped-stacktrace
    *   Thanks to @guncha and @novocaine
    *   https://github.com/novocaine/sourcemapped-stacktrace
    *   https://gist.github.com/guncha/f45ceef6d483c384290a
    */
    env.addReporter({
        jasmineDone: function() {
            var traces = document.querySelectorAll(".stack-trace")
            for(var i = 0; i < traces.length; i++) {
                (function(node){
                    sourceMappedStackTrace.mapStackTrace(node.textContent, function(stack) {
                        node.textContent = node.previousSibling.textContent + "\n" + stack.join("\n")
                    })
                })(traces[i])
            }
        }
    });

    /**
     * Filter which specs will be run by matching the start of the full name against the `spec` query param.
     */
    var specFilter = new jasmine.HtmlSpecFilter({
        filterString: function() { return queryString.getParam("spec"); }
    });

    env.specFilter = function(spec) {
        return specFilter.matches(spec.getFullName());
    };

    htmlReporter.initialize();

})(window);
