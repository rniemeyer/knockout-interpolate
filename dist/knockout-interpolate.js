// knockout-interpolate 0.1.0 | (c) 2015 Ryan Niemeyer |  http://www.opensource.org/licenses/mit-license
;(function(factory) {
    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        factory(require("knockout"));
    } else if (typeof define === "function" && define.amd) {
        define(["knockout"], factory);
    } else {
        factory(ko);
    }
}(function(ko) {
    var defaultProvider = new ko.bindingProvider(); // default provider will have parseBindingsString
    var existingProvider = ko.bindingProvider.instance;

    var pattern = /\{\{.*?}}/g;

    // simple fast match
    function hasTextToInterpolate(node) {
        return node.nodeType === 3 && node.nodeValue.indexOf("{{") > -1;
    }

    ko.bindingProvider.instance = {
        nodeHasBindings: function(node) {
            return hasTextToInterpolate(node) || existingProvider.nodeHasBindings(node);
        },
        getBindingAccessors: function(node, bindingContext) {
            var expression;

            if (hasTextToInterpolate(node)) {
                node.nodeValue = node.nodeValue.replace(pattern, function(match) {
                    expression = match.replace("{{", "").replace("}}", "");
                    // take advantage of existing KO functionality to parse/evaluate binding expression
                    return ko.unwrap(defaultProvider.parseBindingsString("x:" + expression, bindingContext, node).x);
                });

                return;
            }

            return existingProvider.getBindingAccessors(node, bindingContext);
        }
    };
}));