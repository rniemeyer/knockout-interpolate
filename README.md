# knockout-interpolate

## What is this plugin?

This library augments Knockout's default binding provider by adding support for interpolating text while Knockout is visiting each node to determine if it has bindings. This text replacement is designed to be done in a one-time manner (does not react to observables being updated). You would use this functionality in cases where you do want to use text from your view model, but do not need/want the overhead of a binding.

While the replaced text would not react to changes, a common use case may be inside of a container that is bound using the `template` or `with` binding such that the entire area would get swapped out. Values support context variables (`$root`, `$parent`, etc.) and expressions. For interpolation that converts to a containerless binding check out: http://mbest.github.io/knockout.punches/.

## Examples

```js
<div>First name: {{ first }}</div>
<div>Last name: {{ last }}</div>
<div>Full name: {{ first() + " " + last() }}</div>
<div>User: $root.userName</div>
```