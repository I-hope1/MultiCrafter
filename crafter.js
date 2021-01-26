newCrafter('晶体提炼厂', [
	{
		rdminput: false, 
		input: [[Liquids.slag , 3 ], [Items.surgeAlloy , 2 ], [Items.copper , 2 ]], 
		rdmoutput: false, 
		output: [[Items.sand , 2 ]], 
		extraOutput: [[Items.scrap, 1, .1 ]]
	},
	{
		rdminput: false, 
		input: [[Liquids.cryofluid , 3 ], [Items.titanium , 2 ], [Items.metaglass , 2 ]], 
		rdmoutput: false, 
		output: [[Items.sand , 2 ]], 
		extraOutput: [[Items.scrap, 1, .1 ]]
	},
], false);

// 作者: I hope...

window.newCrafter = function(name, array, rand, time, power){

	const 工厂 = extendContent(GenericCrafter, name, {

		init(){

			this.super$init();

			this.outputsLiquid = this.hasLiquids;

		},

		outputsItems(){

			return this.hasItems;

		},

		setStats(){

			this.super$setStats();

			this.stats.add(Stat.output, extend(StatValue, {

				display: table => {

					table.row();

					var table = table.table().padLeft(8).get();

					let size = 8 * 3;

					arr.forEach(e => {

						let t = table.table().left().get();

						table.row();

						if(e.input.map(a => a[0].unlockedNow()).indexOf(false) == -1 && e.output.map(a => a[0].unlockedNow()).indexOf(false) == -1){

							e.input.forEach((a, i) => t.left().add(a[0] instanceof Item ? ItemDisplay(a[0], a[1], true) : LiquidDisplay(a[0], a[1], true), Label(e.rdminput && i != e.input.length - 1 ? '[lightgray]/' : '')));

	

							t.add("[lightgray] -> ");

	

							e.output.forEach((a, i) => t.add(a[0] instanceof Item ? ItemDisplay(a[0], a
