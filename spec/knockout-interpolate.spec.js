chai.should();

describe("knockout-interpolate", function() {
    var vm, content;

    function insertTestCase(html, data) {
        var container = document.createElement("div");
        container.innerHTML = html;
        content.appendChild(container);

        ko.bindingProvider.instance = ko.bindingProvider.interpolate;
        ko.applyBindings(data || vm, content);

        return container;
    }

    beforeEach(function() {
        content = document.createElement("div");
        document.body.appendChild(content);

        vm = {
            first: "Bob",
            last: ko.observable("Smith"),
            trueValue: true,
            falseValue: false,
            aValue: 'a',
            trueValueObs: ko.observable(true),
            falseValueObs: ko.observable(false),
            aValueObs: ko.observable('a')
        };
    });

    afterEach(function() {
        ko.removeNode(content);
    });

    it("should respect normal bindings", function() {
        var test = insertTestCase("<div data-bind=\"text: first\"></div>");

        test.innerHTML.should.eql("<div data-bind=\"text: first\">Bob</div>");
    });

    it("should interpolate a simple value", function() {
        var test = insertTestCase("{{ first }}");

        test.innerHTML.should.eql("Bob");
    });

    it("should interpolate and unwrap an observable", function() {
        var test = insertTestCase("{{ last }}");

        test.innerHTML.should.eql("Smith");
    });

    it("should execute expressions", function() {
        var test = insertTestCase("{{ first + ' ' + last() }}");

        test.innerHTML.should.eql("Bob Smith");
    });

    it("should interpolate multiple values", function() {
        var test = insertTestCase("{{ first }}{{ last }}");

        test.innerHTML.should.eql("BobSmith");
    });

    it("should preserve surrounding characters when interpolating", function() {
        var test = insertTestCase("Hi {{ first }} P {{ last }}!");

        test.innerHTML.should.eql("Hi Bob P Smith!");
    });

    it("should ignore mal-formed interpolation", function() {
        var test = insertTestCase("{{ what");

        test.innerHTML.should.eql("{{ what");
    });

    it("should ignore interpolation outside of text nodes", function() {
        var test = insertTestCase("<div data-bind=\"text: '{{ first }}'\"></div>");

        test.innerHTML.should.eql("<div data-bind=\"text: '{{ first }}'\">{{ first }}</div>");
    });

    it("should not update text when observables update (just one-time replacement)", function() {
        var test = insertTestCase("{{ last }}");

        vm.last("Johnson");

        test.innerHTML.should.eql("Smith");
    });

    describe("attribute tests", function() {
        describe("visible attribute", function() {
            it("should work with attribute-bound visible = false", function() {
                var test = insertTestCase("<div class='marker' data-koset='visible: falseValue'></div>");

                test.getElementsByClassName("marker")[0].style.display.should.eql("none");
            });

            it("should work with attribute-bound visible = true", function() {
                var test = insertTestCase("<div class='marker' data-koset='visible: trueValue'></div>");

                test.getElementsByClassName("marker")[0].style.display.should.eql("");
            });

            it("should work with attribute-bound visible = false -- observable", function() {
                var test = insertTestCase("<div class='marker' data-koset='visible: falseValueObs'></div>");

                test.getElementsByClassName("marker")[0].style.display.should.eql("none");
            });

            it("should work with attribute-bound visible = true -- observable", function() {
                var test = insertTestCase("<div class='marker' data-koset='visible: trueValueObs'></div>");

                test.getElementsByClassName("marker")[0].style.display.should.eql("");
            });
        });

        describe("if attribute", function() {
            it("should work with attribute-bound if = false", function() {
                var test = insertTestCase("<div class='marker' data-koset='if: falseValue'>XXX</div>");

                test.getElementsByClassName("marker")[0].innerHTML.should.eql("");
            });

            it("should work with attribute-bound if = true", function() {
                var test = insertTestCase("<div class='marker' data-koset='if: trueValue'>XXX</div>");

                test.getElementsByClassName("marker")[0].innerHTML.should.eql("XXX");
            });

            it("should work with attribute-bound if = false -- observable", function() {
                var test = insertTestCase("<div class='marker' data-koset='if: falseValueObs'>XXX</div>");

                test.getElementsByClassName("marker")[0].innerHTML.should.eql("");
            });

            it("should work with attribute-bound if = true -- observable", function() {
                var test = insertTestCase("<div class='marker' data-koset='if: trueValueObs'>XXX</div>");

                test.getElementsByClassName("marker")[0].innerHTML.should.eql("XXX");
            });
        });

        describe("value attribute", function() {

            it("should work with attribute-bound value", function() {
                var test = insertTestCase("<select class='marker'><option data-koset='value: aValue'></option></select>");

                var opt = test.getElementsByClassName("marker")[0].firstChild;
                opt.value.should.eql("a");
            });

            it("should work with attribute-bound value with text", function() {
                var test = insertTestCase("<select class='marker'><option data-koset='value: aValue'>{{ last }}</option></select>");

                var opt = test.getElementsByClassName("marker")[0].firstChild;
                opt.value.should.eql("a");
                opt.textContent.should.eql("Smith");
            });

            it("should work with attribute-bound value -- observable", function() {
                var test = insertTestCase("<select class='marker'><option data-koset='value: aValueObs'></option></select>");

                var opt = test.getElementsByClassName("marker")[0].firstChild;
                opt.value.should.eql("a");
            });

            it("should work with attribute-bound value with text -- observable", function() {
                var test = insertTestCase("<select class='marker'><option data-koset='value: aValueObs'>{{ last }}</option></select>");

                var opt = test.getElementsByClassName("marker")[0].firstChild;
                opt.value.should.eql("a");
                opt.textContent.should.eql("Smith");
            });
        });

        describe("attr attribute", function() {
            it("should set title attr", function() {
                var test = insertTestCase("<a class='anchor-first' data-koset='attr: { title: first }'></a>");

                var titleValue = test.getElementsByClassName("anchor-first")[0].getAttribute('title');

                titleValue.should.eql("Bob");
            });

            it("should unwrap observables", function() {
                var test = insertTestCase("<a class='anchor-first' data-koset='attr: { title: last }'></a>");

                var titleValue = test.getElementsByClassName("anchor-first")[0].getAttribute('title');

                titleValue.should.eql("Smith");
            });

            it("should set target attr in ternary true", function() {
                var test = insertTestCase("<a class='anchor-first' data-koset='attr: { target: first == \"Bob\" ? \"_blank\" : \"\" }'></a>");

                var titleValue = test.getElementsByClassName("anchor-first")[0].getAttribute("target");

                titleValue.should.eql("_blank");
            });

            it("should set target attr in ternary false", function() {
                var test = insertTestCase("<a class='anchor-first' data-koset='attr: { target: first == \"BobX\" ? \"_blank\" : \"\" }'></a>");

                var titleValue = test.getElementsByClassName("anchor-first")[0].getAttribute("target");

                titleValue.should.eql("");
            });
        });
    });
});
