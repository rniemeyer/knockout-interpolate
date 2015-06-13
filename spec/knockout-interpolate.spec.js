chai.should();

describe("knockout-interpolate", function() {
    var vm, content;

    function insertTestCase(html, data) {
        var container = document.createElement("div");
        container.innerHTML = html;
        content.appendChild(container);

        ko.applyBindings(data || vm, content);

        return container;
    }

    beforeEach(function() {
        content = document.createElement("div");
        document.body.appendChild(content);

        vm = {
            first: "Bob",
            last: ko.observable("Smith")
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
});