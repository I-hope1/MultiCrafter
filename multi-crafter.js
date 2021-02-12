
// 作者: I hope...
// 内置 “newCrafter函数” 和 “一个ItemsAndLiquids对象(只能在prov时才可使用，i开头为物品，l开头为液体)”
/* 
 * 使用方法: 在main.js里写“this.window = this; require("多合工厂");”
 * 然后调用newCrafter函数即可构造
*/
window.newCrafter = function(name, array, rand, time, power){
	const 工厂 = new JavaAdapter(GenericCrafter, {
		outputsItems(){
			return this.hasItems;
		},
		setStats(){
			this.super$setStats();
			this.stats.add(Stat.output, extend(StatValue, {
				display(table){
					table.row();
					var table = table.table().padLeft(8).get(), size = 8 * 3;
					for(let e of arr){
						let t = table.table().left().get();
						table.row();
						if(e.input.concat(e.output).concat(e.extraOutput || []).map(a => a[0].unlockedNow()).indexOf(false) == -1){
							e.input.forEach((a, i) => t.left().add(a[0] instanceof Item ? ItemDisplay(a[0], a[1], true) : LiquidDisplay(a[0], a[1], true), Label(e.rdminput && i != e.input.length - 1 ? ' [lightgray]/ ' : '', Styles.techLabel)));
	
							t.add("[lightgray] -> ");
	
							e.output.forEach((a, i) => t.add(a[0] instanceof Item ? ItemDisplay(a[0], a[1], true) : LiquidDisplay(a[0], a[1], true), Label(e.rdmoutput && i != e.outpus.length - 1 ? ' [lightgray]/ ' : '', Styles.techLabel)));
							if(e.extraOutput instanceof Array){
								t.add(' [lightgray]+ ');
								e.extraOutput.forEach(s => t.add((s[2] * 100) + '[gray]%') && t.add(ItemDisplay(s[0], s[1])));
							}
						}
					};
				}
			}));
		}
	}, name || Array(16).fill().map(e => String.fromCharCode(Mathf.random(65, 123) | 0)).join(''));

	const arr = array instanceof Array ? array : [];
	const random = rand;

	工厂.hasItems = 工厂.hasLiquids = false;

	// 用Time.run是为了在json加载后加载
	Time.run(1, run(() => [(() => {
		let obj = window.ItemsAndLiquids = {};
		for(let item of Vars.content.items().toArray()) obj['i' + item.name] = item;
		for(let liquid of Vars.content.liquids().toArray()) obj['l' + liquid.name] = liquid;
		if(arr.length == 0 && array instanceof Prov){
			try{
				let arr2 = array.get();
				for(let i of arr2){
					arr.push(i);
				}
			}catch(e){
				return Vars.ui.showErrorMessage(e);
			}
		}
	})(), arr.forEach(e => {
		/* 注意:random与输出不能同为true */
		if(e.rdmoutput && random) return Vars.ui.showErrorMessage('[red]Error: []random与rdmoutput同为true');
		// 将“物品”变成“[物品, 1]”
		e.input.forEach((s, i) => {
			if(e.input[i] instanceof Content) e.input[i] = [e.input[i], 1];
			工厂['has' + (e.input[i][0] instanceof Item ? 'Items' : 'Liquids')] = true; // 确定是否有物品/液体
		});
		e.output.forEach((s, i) => {
			if(e.output[i] instanceof Content) e.output[i] = [e.output[i], 1];
			工厂['has' + (e.output[i][0] instanceof Item ? 'Items' : 'Liquids')] = true; // 确定是否有物品/液体
		});
		if(e.extraOutput instanceof Array) e.extraOutput.forEach((s, i) => {
			if(s instanceof Content) e.extraOutput[i] = [s, 1, .5];
			s[2] = s[2] || .5;
			工厂['has' + (e.extraOutput[i][0] instanceof Item ? 'Items' : 'Liquids')] = true; // 确定是否有物品/液体
		});
		工厂.outputsLiquid = 工厂.hasLiquids;
	})]));
	
	var getType = cont => cont instanceof Item ? 'item' : 'liquid';
	var equal = (p1, p2, p3) => p3 ? p1 == p2 : p1 != p2;

	工厂.localizedName = name;
	工厂.conveyorPlacement = true;
	工厂.buildVisibility = BuildVisibility.shown;
	工厂.category = Category.crafting;
	工厂.drawer = new DrawGlow;
	工厂.consumes.remove(ConsumeType.item);
	工厂.consumes.add(extend(Consume, {
		type(){
			return ConsumeType.item;
		},
		valid(entity){
			return entity.consValid();
		}
	}));
	if(power) 工厂.consumes.power(power);
	工厂.itemCapacity = 10;
	工厂.craftTime = time || 30;
	工厂.buildType = prov(() => extend(Building, {
		'time':0, warmup:0,
		displayConsumption(table){
			var lastID = 0;
			let t = table.left(), array = [], time = 0;
			arr.forEach(e => e.rdminput ? e.input.forEach(s => array.push([[s[0], s[1]]])) : array.push(e.input));
			t.update(() => {
				if((time += this.delta()) >= 60){
					t.clear();
					array[lastID++ % array.length].forEach(e => {
						let stack = e;
						t.add(ReqImage(ItemImage(e[0].icon(Cicon.medium), e[1]), boolp(() => this[getType(stack[0]) + 's'].get(stack[0]) >= stack[1]))).padRight(8);
					});
					time = 0;
				}
			});
		},
		acceptLiquid(source, liquid){
			return this.block.hasLiquids && source.team == this.team && arr.map(e => e.input.map(a => a[0]).indexOf(liquid) != -1).indexOf(true) != -1 && this.liquids.get(liquid) < this.block.liquidCapacity;
		},
		acceptStack(item, amount, unit){
			return (unit == null || (unit.team instanceof Team ? unit.team : unit.team()) == this.team) && this.acceptItem(this, item) ? Math.min(this.block.itemCapacity - this.items.get(item), amount) : 0;
		},
		acceptItem(source, item){
			return this.block.hasItems && source.team == this.team && arr.map(e => e.input.map(a => a[0]).indexOf(item) != -1).indexOf(true) != -1 && this.items.get(item) < this.block.itemCapacity;
		},
		draw(){
			this.super$draw();
			//Draw.rect(this.block.name + '-rotator', this.x, this.y, this.time / this.block.craftTime * 360);
			Draw.alpha(Mathf.absin(this.time, 9, .3) * this.warmup);
			Draw.rect(this.block.drawer.top, this.x, this.y);
			Draw.reset();
		},
		isVaild(arr){
			return equal(arr.input.map(e => this[getType(e[0]) + 's'].get(e[0]) >= e[1]).indexOf(arr.rdminput), -1, !arr.rdminput)
			&& equal(arr.output.map(e => this[getType(e[0]) + 's'].get(e[0]) + e[1] <= this.block[getType(e[0]) + 'Capacity']).indexOf(arr.rdmoutput), -1, !arr.rdmoutput)
			&& (arr.extraOutput == null || arr.extraOutput.map(e => this[getType(e[0]) + 's'].get(e[0]) + e[1] <= this.block[getType(e[0]) + 'Capacity']).indexOf(false) == -1);
		},
		consVaild(){
			return arr.map(e => this.isVaild(e)).indexOf(true) != -1 && (this.power == null && this.power.status > 0);
		},
		updateTile(){
			// 输出物品/液体
			for(let e of arr){
				e.output.forEach(items => this['dump' + (items[0] instanceof Item ? '' : 'Liquid')](items[0]));
				if(e.extraOutput instanceof Array) e.extraOutput.forEach(s => this['dump' + (s[0] instanceof Item ? '' : 'Liquid')](s[0]));
			}
			if(!this.consVaild()) return this.warmup = Mathf.lerpDelta(this.warmup, 0, 0.02);
			this.warmup = Mathf.lerpDelta(this.warmup, 1, 0.02);
			if((this.time += this.getProgressIncrease(this.block.craftTime)) >= 1 && Mathf.chanceDelta(this.block.updateEffectChance)){
				this.block.updateEffect.at(this.x + Mathf.range(this.block.size * 4), this.y + Mathf.range(this.block.size * 4));
			}

			for(let e of arr){
				if(this.time < 1 || !this.isVaild(e)) continue;
				if(e.rdminput){
					let arr = [];
					e.input.forEach(a => this[getType(a[0]) + 's'].get(a[0]) >= a[1] && arr.push(a));
					let stack = arr[Mathf.random(arr.length) | 0];
					this[getType(stack[0]) + 's'].remove(stack[0], stack[1]);
				}else e.input.forEach(a => this[getType(a[0]) + 's'].remove(a[0], a[1]));
				if(random){
					let sum = 0, item = null, amount = 0;
					e.output.forEach(a => sum += a[1]);
					let rad = Mathf.random(sum);
					for(let i = 0, len = e.output.length; i < len; i++){
						let array = e.input[i];
						if(sum + array[1] > rad){
							item = array[0];
							amount = array[1];
							break;
						}
						sum += array[1];
					}
					if(item != null){
						this[getType(array[0]) + 's'].add(item, amount);
					}
				}else if(e.rdmoutput){
					let array = e.output[Mathf.random(e.output.length)];
					this[getType(array[0]) + 's'].add(array[0], array[1]);
				}else e.output.forEach(a => this[getType(a[0]) + 's'].add(a[0], a[1]));
				if(e.extraOutput instanceof Array) e.extraOutput.forEach(s => Math.random() < s[2] ? this[getType(s[0]) + 's'].add(s[0], s[1]) : '');
				this.block.craftEffect.at(this.x, this.y);
				this.time %= 1 / this.block.craftTime;
			};
		},
		write(write){
			this.super$write(write);
			write.f(this.time);
			write.f(this.warmup);
		},
		read(read, revision){
			this.super$read(read, revision);
			this.time = read.f();
			this.warmup = read.f();
		}
	}));
	return 工厂;
};
