# MultiCrafter
## Description
a js for Mindustry mod
## Example usage
### first
open your "main.js" in your mod
### then
write "this.window = this" (if you already have it, you don't have to)
### after that
write "require('multi-crafer')"
### at last
write "newCrafer(xxx)"
## Case
```js
this.window = this;
require('multi-crafer');
newCrafter('case', /* name */ prov(() => [
	{
		rdminput: true, /* input any one */
		input: [[Items.copper, /* item/liquid */ 2 /* amount */], [Items.lead, 2], Items.titanium /* direct item/liquid, amount is 1 */], /* input */
		rdmoutput: false, /* output any one */
		output: [ItemsAndLiquids['isand'] /* use string find item/liquid，i starts with an item，l starts with an liquid */], /* output */
		extraOutput: [[Items.scrap, 1, .5 /* chance(default 0.5) */]]
	},
	{
		rdminput: false,
		input: [[Vars.content.getByName(ContentType.item, 'coal'), 1], [Liquids.water, 2]],
		rdmoutput: false,
		output: [[Liquids.oil, 2]]
	}
]), /* plan(s) */ false, /* random */ 30, /* craft time */ 10 /* consume power */);
```
this is: <a href="https://github.com/I-hope1/MultiCrafter/tree/case">case</a>
