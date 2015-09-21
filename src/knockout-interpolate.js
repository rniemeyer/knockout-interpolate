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

    function hasInterpolationAttribute(node) {
        return node.attributes && node.attributes["data-koset"];
    }

    function getValueOfExpression(rawExpression, bindingContext, node) {
        var expression = rawExpression.replace("{{", "").replace("}}", "");
        // take advantage of existing KO functionality to parse/evaluate binding expression
        return ko.unwrap(defaultProvider.parseBindingsString("x:" + expression, bindingContext, node).x);
    }

    function processInterpolationAttribute(node, bindingContext) {
        var bindingValues = defaultProvider.parseBindingsString(node.attributes["data-koset"].value, bindingContext, node);
        if (bindingValues.hasOwnProperty("visible") && !ko.unwrap(bindingValues.visible)){
            node.style.display = "none";
        }
        if (bindingValues.hasOwnProperty("if") && !ko.unwrap(bindingValues["if"])){
            node.innerHTML = "";
        }
        if (bindingValues.hasOwnProperty("value")){
            node.value = ko.unwrap(bindingValues.value);
        }
        if (bindingValues.hasOwnProperty("attr")){
            Object.keys(bindingValues.attr).forEach(function(attrName){
                node.setAttribute(attrName, bindingValues.attr[attrName]);
            });
        }
    }

    ko.bindingProvider.interpolate = {
        nodeHasBindings: function(node) {
            return hasTextToInterpolate(node) || hasInterpolationAttribute(node) || existingProvider.nodeHasBindings(node);
        },
        getBindingAccessors: function(node, bindingContext) {
            if (hasTextToInterpolate(node)) {
                node.nodeValue = node.nodeValue.replace(pattern, function(match) {
                    return getValueOfExpression(match, bindingContext, node);
                });

                return;
            } else if (hasInterpolationAttribute(node)) {
                processInterpolationAttribute(node, bindingContext);
            }

            return existingProvider.getBindingAccessors(node, bindingContext);
        }
    };
}));
