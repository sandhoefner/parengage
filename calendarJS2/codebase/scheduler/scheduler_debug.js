/*
@license
webix UI v.3.2.2
This software is covered by Webix Trial License.
Usage without proper license is prohibited.
(c) XB Software Ltd.
*/
webix.protoUI({
	name:"dayevents",
	defaults:{
		hourFormat:"%H",
		hourClock:12,
		firstHour:0,
		lastHour:24,
		timeScaleWidth:25,
		minEventHeight: 20,
		timeScaleHeight: 40,
		scroll:true,
		scaleBorder:1,
		eventOffset:5,
		separateShortEvents: true,
		width:"auto",
		date: new Date()
	},
	$init:function(config){ 
		this.name = "DayEvents";
		
		this._dataobj.style.position = "relative";
		this._viewobj.className += " webix_dayevents";
		this.data.provideApi(this,true);
		this.data.attachEvent("onStoreUpdated",webix.bind(this.render,this));
		
		this.attachEvent("onBeforeRender", function(){
			this._renderScale();
			this.type.color = this.config.color;
			this.type.textColor = this.config.textColor;
			this._renderobj = this._dataobj.firstChild;
			this._prepareEvents();
			if(window.scheduler&&scheduler.templates){
				this.type.template = scheduler.templates.day_event;
				this.type.templateCss = scheduler.templates.event_class;
			}
		});
		if(window.scheduler){
			config.hourFormat = scheduler.config.scale_hour;
			config.timeScaleWidth = scheduler.xy.scale_width;
			config.minEventHeight = scheduler.xy.min_event_height;
			config.timeScaleHeight = scheduler.xy.scale_height*2;
			config.separateShortEvents = scheduler.config.separate_short_events;
		}
	},
	_renderScale:function(){
		var html = "<div></div>";
		for(var h = this.config.firstHour; h<this.config.lastHour; h++){
			html += this.hourScaleItem(h);
		}
		this._dataobj.innerHTML = html;
	},
	_id:"webix_l_id",
	on_click:{
	},
	hourScaleItem: function(hour){
		var hourDate = scheduler.config.hour_date,
			hourFormat = this.config.hourFormat,
			isAM = (hourDate.toLowerCase().indexOf("a")!=-1),
			isHour12 = (hourDate.indexOf("h")!=-1 || hourDate.indexOf("g")!=-1),
			top = '00',
			bottom = '30';

		if(isHour12){
			if(isAM){
				if(hour===0)
					top = 'AM';
				if(hour==12)
					top = 'PM';
			}

			// compatibility with prev version
			// when scale_hour "%H" worked like "%h" in 12-hour format
			hourFormat = hourFormat.replace("H","h");
		}
		else{

			// compatibility with prev version
			// when scale_hour "%h" worked like "%G" in 24-hour format
			hourFormat = hourFormat.replace("h","G");
		}

		var  d = new Date();
		d.setHours(hour);
		hour = webix.Date.dateToStr(hourFormat)(d);

        var html = "";
		var timeScaleWidth = this.config.timeScaleWidth;
		var hourHeight = this.config.timeScaleHeight;
        var sectionWidth = Math.floor(this.config.timeScaleWidth);
        var heightTop = Math.floor(hourHeight/2);
		var heightBottom = heightTop-this.config.scaleBorder;
		var eventZoneWidth = this._content_width-this.config.scaleBorder-this.config.timeScaleWidth;
		html += "<div style='width: 100%; height:"+hourHeight+"px;' class='webix_dayevents_scale_item'>";
		html += "<div class='webix_dayevents_scale_hour' style='width:"+sectionWidth+"px; height:"+hourHeight+"px;line-height:"+hourHeight+"px;'>"+hour+"</div>";
		html += "<div class='webix_dayevents_scale_event'  style='width:"+eventZoneWidth+"px'>";
		html += "<div class='webix_dayevents_scale_top' style='height:"+heightTop+"px;width:"+eventZoneWidth+"px'></div>";
		html += "</div>";
		html += "</div>";
        return html;		
	},
	type:{
		templateStart:webix.template("<div webix_l_id='#id#' class='webix_dayevents_event_item {common.templateCss()}' style='left:#$left#px;top:#$top#px;width:#$width#px;height:#$height#px;padding:{common.padding}px;overflow:hidden; {common.templateColor()} ;'>"),
		template:"#text#",
		templateEnd:webix.template("</div>"),
		templateCss:webix.template(""),
		templateColor: function(obj){
		   return (window.scheduler?scheduler.templates.day_event_style(obj):"");
		},
		padding:4
	},
	_prepareEvents:function(){
		var evs = this.data.getRange();
		var stack = [];
		var ev,i,j,k,_is_sorder,_max_sorder,_sorder_set;
		this._minMappedDuration = Math.ceil(this.config.minEventHeight * 60 / (this.config.timeScaleHeight+1));  // values could change along the way
		for(i=0; i< evs.length;i++){
			ev=evs[i];
			ev.$inner=false;
			while (stack.length && this._getEventEndDate(stack[stack.length-1]).valueOf()<=ev.start_date.valueOf()){
				stack.splice(stack.length-1,1);
			}
			_sorder_set = false;
			
			for(j=0;j< stack.length;j++){
				if(this._getEventEndDate(stack[j]).valueOf()<=ev.start_date.valueOf()){
					_sorder_set = true;
					ev.$sorder=stack[j].$sorder;
					stack.splice(j,1);
					ev.$inner=true;
					break;
				}
			}
			
			if (stack.length) stack[stack.length-1].$inner=true;
			
			if(!_sorder_set){
				if(stack.length){
					if(stack.length<=stack[stack.length-1].$sorder){
						if(!stack[stack.length-1].$sorder)
							ev.$sorder = 0; 
						else
							for(j=0;j<stack.length;j++){
								_is_sorder = false;
								for(k=0;k<stack.length;k++){
									if(stack[k].$sorder==j){
										_is_sorder = true;
										break;
									}
								}
								if(!_is_sorder){
									ev.$sorder = j; 
									break;
								}	
							}
						ev.$inner = true;
					}
					else{
						_max_sorder = stack[0].$sorder;
						for(j =1;j < stack.length; j++)
							if(stack[j].$sorder>_max_sorder)
								_max_sorder = stack[j].$sorder;
						ev.$sorder = _max_sorder+1;
						ev.$inner = false;
					}
				}
				else 
					ev.$sorder = 0; 
			}
			stack.push(ev);
			if (stack.length>(stack.max_count||0)) stack.max_count=stack.length;
		}
		
		for (var i=0; i < evs.length; i++){ 
			evs[i].$count=stack.max_count;
			this._setPosition(evs[i]);
		}
	},
	_setPosition:function(ev){
		
		var date = this.config.date.getValue?this.config.date.getValue():this.config.date;
		
		var start = webix.Date.copy(ev.start_date);
		var end = webix.Date.copy(ev.end_date);
		var sh = start.getHours();
		var eh = end.getHours();
		if(webix.Date.datePart(start,true).valueOf()>webix.Date.datePart(end,true).valueOf()){
			end = start;
		}
		
		if(webix.Date.datePart(start,true).valueOf()<webix.Date.datePart(date,true).valueOf()){
			start = webix.Date.datePart(date);
		}
		if(webix.Date.datePart(end,true).valueOf()>webix.Date.datePart(date,true).valueOf()){
			end = webix.Date.datePart(date,true);
			end.setMinutes(0);
			end.setHours(this.config.lastHour);
		}
		if (sh < this.config.firstHour || eh >= this.config.lastHour){
			if (sh < this.config.firstHour){
				start.setHours(this.config.firstHour);
				start.setMinutes(0);
			}
			if (eh >= this.config.lastHour){
				end.setMinutes(0);
				end.setHours(this.config.lastHour);
			}
		}
		var temp_width = Math.floor((this._content_width-this.config.timeScaleWidth-this.config.eventOffset)/ev.$count);
		ev.$left=ev.$sorder*(temp_width)+this.config.timeScaleWidth+this.config.eventOffset;
		if (!ev.$inner) temp_width=temp_width*(ev.$count-ev.$sorder);
		ev.$width = temp_width-this.config.eventOffset-this.type.padding*2;
		
		var sm = start.getHours()*60+start.getMinutes();
		var em = (end.getHours()*60+end.getMinutes())||(this.config.lastHour*60);
		ev.$top = Math.round((sm-this.config.firstHour*60)*(this.config.timeScaleHeight+1)/60); //42px/hour
		ev.$height = Math.max(this.config.minEventHeight,(em-sm)*(this.config.timeScaleHeight+1)/60-1)-this.type.padding*2;
	},
	_getEventEndDate: function(ev) {
		var end_date = ev.end_date;
		if (this.config.separateShortEvents) {
			var ev_duration = (ev.end_date - ev.start_date) / 60000; // minutes
			if (ev_duration < this.config.minEventHeight) {
				end_date = webix.Date.add(end_date, this._minMappedDuration - ev_duration, "minute",true);
			}
		}
		return end_date;
	},
	$setSize:function(x,y){ 
		if (webix.ui.view.prototype.$setSize.call(this,x,y)){
			this.render();
		}
	}
}, webix.MouseEvents, webix.SelectionModel, webix.Scrollable, webix.RenderStack, webix.DataLoader, webix.ui.view, webix.EventSystem, webix.Settings);



if (!window.scheduler)
	window.scheduler = {	
		config:{},
		templates:{},
		xy:{},
		locale:{}
	};

/*Locale*/
if(!scheduler.locale)
	scheduler.locale = {};

scheduler.locale.labels = {
	week_tab : "Week",
	day_tab : "Day",
	month_tab : "Month",
	icon_today : "Today",
	icon_save : "Save",
	icon_done : "Done",
	icon_delete : "Delete event",
	icon_cancel : "Cancel",
	icon_edit : "Edit",
	icon_back : "Back",
	icon_close : "Close form",
	icon_yes : "Yes",
	icon_no : "No",
	confirm_closing : "Your changes will be lost, are your sure ?",
	confirm_deleting : "The event will be deleted permanently, are you sure?",
	label_event:"Event",	
	label_start:"Start",
	label_end:"End",
	label_details:"Notes",
	label_from: "from",
	label_to: "to",
	label_allday: "All day",
	label_time: "Time",
	label_no_events : "No Events"
};

/*Config*/

/*date*/

scheduler.config = {
	init_date : new Date(),
	form_date : "%d-%m-%Y %H:%i",
	form_all_day : "%d-%m-%Y",
	parse_date : "%Y-%m-%d %H:%i",
	week_date: "%D, %d %M",
	dyn_load_date : "%Y-%m-%d",
	item_date : "%d.%m.%Y",
	all_day_date : "%l, %d %F %Y",
	day_header_date : "%d.%m.%Y",
	week_header_date : "%d.%m.%Y",
	hour_date : "%H:%i",
	scale_hour : "%H",
	calendar_date : "%F %Y",
	calendar_hour : "%H:%i",
	form_rules : {
		end_date:function(value,obj){
			return (obj.start_date.valueOf() < value.valueOf());
		}
	},
	multi_day: true,
	multi_day_limit: 3,
	views : [],
	tab_views : [],
	server_utc: false,
	separate_short_events: true
};

/*Dimensions*/
scheduler.xy = {
   	confirm_height : 231,
	confirm_width : 250,
	scale_width : 40,
	min_event_height: 20,
	scale_height : 20,
	week_tab:60,
	day_tab:60,
	month_tab:68,
	icon_today : 55,
	icon_save : 90,
	icon_done : 90,
	icon_cancel : 80,
	icon_edit : 90,
	icon_back : 70,
	list_header_height: 30,
	list_height: 50,
	all_day: 120,
	month_list_height: 50
};

/*Templates*/
scheduler.templates = {
	day_event_style: function(obj){
		var style = "";
		if(obj.color){
			var rgb = webix.color.toRgb(obj.color);
			style += ";border-color:"+obj.color+";";
			style += "background-color:rgba("+rgb.toString()+",0.3);";
			var hsv = webix.color.rgbToHsv(rgb[0],rgb[1],rgb[2]);
			hsv[2] /= 1.6;
			var color = "rgb("+webix.color.hsvToRgb(hsv[0],hsv[1],hsv[2])+")";
			style += "color:"+color;
		}
		return style;
	},
	multi_day_event_style: function(obj){
		var style = "";
		if(obj.color){
			var rgb = webix.color.toRgb(obj.color);

			style += ";background-color:rgba("+rgb.toString()+",0.3);";
			var hsv = webix.color.rgbToHsv(rgb[0],rgb[1],rgb[2]);
			hsv[2] /= 1.6;
			var color = "rgb("+webix.color.hsvToRgb(hsv[0],hsv[1],hsv[2])+")";
			style += "color:"+color;
		}
		return style;
	},
	selected_event : function(obj){
		var html = "", fts="", fte="";
		var start = obj.start_date;
		var end = obj.end_date;
		
		if(!start) return html;
		html += "<div  class='selected_event "+scheduler.templates.event_class(obj)+"'  >";
		html += "<div class='event_title'>"+obj.text+"</div>";
		
		if(webix.Date.datePart(start,true).valueOf()==webix.Date.datePart(end,true).valueOf()){
			var fd = webix.i18n.dateFormatStr(start);
			fts = webix.i18n.timeFormatStr(start);
			fte = webix.i18n.timeFormatStr(end);
			html += "<div class='event_text'>"+fd+"</div>";
			html += "<div class='event_text'>"+scheduler.locale.labels.label_from+" "+fts+" "+scheduler.locale.labels.label_to+" "+fte+"</div>";
		}
		else{
			var fds = webix.i18n.longDateFormatStr(start);
			var fde = webix.i18n.longDateFormatStr(end);
			/*if not "all-day" event*/
			if(!(webix.Date.datePart(start,true).valueOf()==start.valueOf()&&webix.Date.datePart(end,true).valueOf()==end.valueOf())){
				fts = webix.i18n.timeFormatStr(start)+" ";
				fte = webix.i18n.timeFormatStr(end)+" ";
			}
			html += "<div class='event_text'>"+scheduler.locale.labels.label_from+" "+fts+fds+"</div>";
			html += "<div class='event_text'>"+scheduler.locale.labels.label_to+" "+fte+fde+"</div>";
		}
		if(obj.details&&obj.details!==""){
			html += "<div class='event_title'>"+scheduler.locale.labels.label_details+"</div>";
			html += "<div class='event_text'>"+obj.details+"</div>";
		}
		html += "</div>";
		return html;
	},
	week_title: function(date){
		var start = webix.Date.weekStart(date);
		var end = webix.Date.add(start,6,"day",true);
		return webix.i18n.headerWeekFormatStr(start)+"&nbsp;-&nbsp;"+webix.i18n.headerWeekFormatStr(end);
	},
	calendar_event : function(day){
		return "<div class='webix_cal_day_event'>"+day.getDate()+"</div>"+"<div class='webix_cal_event_marker'></div>";
	},
	event_date: function(value){
		var date = new Date(parseInt(value,10));
		var isCurrent = (webix.Date.datePart(date).valueOf() == webix.Date.datePart(new Date()).valueOf());
		return "<span class='webix_unit_header_inner"+(isCurrent?" today":"")+"'>"+webix.i18n.weekDateFormatStr(date)+"</span>";
	},
	/*event_long_date: function(date){
		if(date.start_date)
			date = date.start_date;
		return webix.i18n.longDateFormatStr(date);
	},*/
	event_time : function(obj){
		var start = obj.start_date;
		var end = obj.end_date;
		if(!(webix.Date.datePart(start,true).valueOf()==start.valueOf()&&webix.Date.datePart(end,true).valueOf()==end.valueOf()))
			return webix.i18n.timeFormatStr(start);
		else
			return scheduler.locale.labels.label_allday;
	},
	event_marker : function(obj,type){
		var style = "";
		if(obj.color){
			var rgb = webix.color.toRgb(obj.color);
			style += ";border-color:"+obj.color+";";
			style += "background-color:rgba("+rgb.toString()+",0.9);";

		}
   		return "<div class='webix_event_marker' ><div style='"+style+"'></div></div>";
	},
	event_title: function(obj,type){
		return "<div class='webix_event_overall "+type.eventClass(obj,type)+"'><div class='webix_event_time'>"+type.timeStart(obj)+"</div>"+type.marker(obj,type)+"<div class='webix_event_text' "+(obj.textColor?"style='color:"+obj.textColor:"")+"'>"+obj.text+"</div></div>";
	},
	month_event_title : function(obj,type){
		return "<div class='webix_event_overall "+type.eventClass(obj,type)+"'><div class='webix_event_time'>"+type.timeStart(obj)+"</div>"+type.marker(obj,type)+"<div class='webix_event_text' "+(obj.textColor?"style='color:"+obj.textColor:"")+"'>"+obj.text+"</div></div>";
	},
	day_event: function(obj,type){
		return obj.text;
	},
	multi_day_event: function(obj,type){
		return obj.text;
	},
	new_event_data: function(){
	    var hours = (webix.Date.add(new Date(),1,"hour",true)).getHours();
		var start = webix.Date.copy(this.coreData.getValue());
		start.setHours(hours);
		var end = webix.Date.add(start,1,"hour",true);
		return {start_date:start,end_date:end};
	},
	event_class: webix.template("")
};


webix.protoUI({
	name:"datetext",
	defaults:{
		template:function(obj,common){
			return common._render_div_block(obj, common);
		},
		icon: "angle-right"
	},
	$renderIcon:function(){
		var config = this.config,
			height = config.aheight - 2*config.inputPadding,
			padding = (height - 18)/2-1;
		return config.icon?("<span style=height:"+(height-padding)+"px;padding-top:"+padding+"px;' class='webix_input_icon  fa-"+config.icon+"'></span>"):"";
	},
	_after_render:function(obj){
		if (webix.isUndefined(obj.value)) return;
		this.$setValue(obj.value);
	},
	setValue:function(value, forceReset){
		var oldvalue = this.config.value;
		var changed = true;
		if (oldvalue == value){
			changed = false;
			if(!forceReset)
				return false;
		}

		this.config.value = value;
		if (this._rendered_input)
			this.$setValue(value);

		if(changed)
			this.callEvent("onChange", [value, oldvalue]);
	},
	$setValue:function(value){
		this.config.value = (value||"");
		var format = (this.config.dateFormatStr||webix.i18n.dateFormatStr);
		this.config.text = this.getInputNode().innerHTML = (typeof this.config.value=="object"?(format(this.config.value)):this.config.value);
	},
	dateFormat_setter:function(value){
		this.config.dateFormatStr = webix.Date.dateToStr(value);
		return webix.Date.strToDate(value);
	},
	getValue:function(){
		return this.config.value||null;
	},
	getInputNode: function(){
		return this._dataobj.getElementsByTagName("DIV")[1];
	}
}, webix.ui.text);

/* Weekevents view extended from List view*/
webix.protoUI({
	name:"weekevents",
	_id:"webix_item_id",
	on_click: {

	},
	render:function(id,data,type,after){

		var config = this.config;
		if (!this.isVisible(this.config.id))
			return;

		//full reset
		if (this.callEvent("onBeforeRender",[this.data])){
			this.units = null;
			this._setUnits();
			if(this.units){
				data = this._getUnitRange();
				if(!data.length)
					this._dataobj.innerHTML = "<div class='webix_noevents'>"+this.config.noEvents+"</div>";
				else
					this._dataobj.innerHTML = data.map(this._toHTML, this).join("");

				this._htmlmap = null;
			}
			this.callEvent("onAfterRender",[]);
		}
	},
	_toHTML:function(obj){
		//check if related template exist
		this.callEvent("onItemRender",[obj]);
		if(obj.$unit){
			return this.type.templateStartHeader(obj,this.type)+this.type.templateHeader.call(this,obj.$unit)+this.type.templateEnd(obj, this.type);
		}
		return this.type.templateStart(obj,this.type)+(obj.$template?this.type["template"+obj.$template]:this.type.template)(obj,this.type)+this.type.templateEnd(obj, this.type);
	},
	_getUnitRange:function(){
		var data,i,u,unit;
		data = [];
		for(u in this.units){
			data.push({$unit:u});
			unit = this.units[u];
			for(i=0;i < unit.length;i++){
				var event = webix.extend({},unit[i]);
				//event.$unitValue = u;
				data.push(event);
			}
		}

		return webix.toArray(data);
	},
	_setUnits: function(){
		var scheduler = this.getTopParentView();
		var d = scheduler.coreData.getValue();

		var start = webix.Date.weekStart(d);
		var end = webix.Date.add(start,1,"week",true);

		this.units = {};
		var sd;

		while(start.valueOf()<end.valueOf()){
			var next = webix.Date.add(start,1,"day",true);
			var result = scheduler._correctEventsDates(start,scheduler.getEvents(start, next));
			if(result.length)
				this.units[start.valueOf()] = result;

			start = webix.Date.add(start,1,"day",true);
		}
	},

	type:{
		headerHeight: 28,
		templateHeader: function(value){
			var date = new Date(parseInt(value,10));
			var isCurrent = (webix.Date.datePart(date).valueOf() == webix.Date.datePart(new Date()).valueOf());
			return "<span class='webix_unit_header_inner"+(isCurrent?" current":"")+"'>"+webix.i18n.weekDateFormatStr(date)+"</span>";
		},
		templateStart:function(obj,type){
			if(obj.$unit)
				return type.templateStartHeader.apply(this,arguments);
			var className = "webix_list_item webix_list_"+(type.css)+"_item"+(obj.$selected?"_selected":"");
			var style = "width:auto; height:"+type.height+"px; padding:"+type.padding+"px; margin:"+type.margin+"px; overflow:hidden;"+(type.layout&&type.layout=="x"?"float:left;":"");
			return "<div webix_item_id='"+obj.id+"' class='"+className+"' style='"+style+"'>";
		},
		templateStartHeader:function(obj,type){
			var className = "webix_unit_header webix_unit_"+(type.css)+"_header"+(obj.$selected?"_selected":"");
			var style = "width:auto; height:"+type.headerHeight+"px; overflow:hidden;";
			return "<div webix_unit_id='"+obj.$unit+"' class='"+className+"' style='"+style+"'>";
		}
	}
}, webix.ui.list);


/*DHX:Depend touchui.css*/

webix.ready(function(){
	webix.callEvent("onBeforeSchedulerInit",[]);
	
	if (scheduler.locale&&scheduler.locale.date)
		webix.Date.Locale = scheduler.locale.date;

	var config  = scheduler.config;
	var labels = scheduler.locale.labels;
	var templates = scheduler.templates;

	if(!config.form){
		config.form = [
			{view:"text",		label:labels.label_event, labelWidth: 90,	name:'text'},
			{view:"datetext",	label:labels.label_start, labelWidth: 90,	id:'start_date',name:'start_date', dateFormat:config.form_date},
			{view:"datetext",	label:labels.label_end, labelWidth: 90,	id:'end_date',name:'end_date', dateFormat:config.form_date},
			{view:"checkbox",	id:'allDay', name:'allDay', label:labels.label_allday, labelWidth: 100,  value:0},
			{view:"textarea",	label:labels.label_details,	name:'details', labelWidth: 90,		height:150},
			{}
		];
	}
	if(!config.calendar_hour){
		var hourPart = config.hour_date.match(/%[h,H,g,G]/gi);
		var aPart = config.hour_date.match(/%[a,A]/gi);
		config.calendar_hour = hourPart[0]+(aPart?" "+aPart[0]:"");
    }
	if(!config.bottom_toolbar){
		config.bottom_toolbar = [
 			{ view:"label",id:"today", name: "today",  label:labels.icon_today,inputWidth:scheduler.xy.icon_today, align:"center",width:scheduler.xy.icon_today+6},
 			{ view:"segmented", id:"buttons",value:(config.mode||"week"),align:"center",multiview:true, options:[
				{id:"day", value:labels.day_tab,width:scheduler.xy.day_tab},
				{id:"week", value:labels.week_tab,width:scheduler.xy.week_tab},
    			{id:"month", value:labels.month_tab,width:scheduler.xy.month_tab}
			]},
			{ view:"label",  css:"add",name:"add",id:"add", align:"center",label:"&nbsp;+&nbsp;",width:45},
			{ view:"label", label:"",width:45, batch:"readonly"}
		];
	}
	if(!config.day_toolbar){
		config.day_toolbar = [
			{view:'label',id:"prev",align:"left",label:"<div class='webix_cal_prev_button'><div></div></div>"},
			{view:'label',id:"date",align:"center",width:200},
			{view:'label',id:"next",align:"right",label:"<div class='webix_cal_next_button'><div></div></div>"}
		];
	}
	if(!config.week_toolbar){
		config.week_toolbar = [
			{view:'label',name: 'prevWeek', id:"prevWeek", width: 40,align:"left",label:"<div class='webix_cal_prev_button'></div>"},
			{view:'label',id:"weekTitle",align:"center"},
			{view:'label',id:"nextWeek",align:"right",label:"<div class='webix_cal_next_button'></div>",width: 40}
		];
	}
	if(!config.selected_toolbar){
		config.selected_toolbar = [
			{view:'label', width:scheduler.xy.icon_back, css:"cancel", name:"back", id:"back",align:"center",label:labels.icon_back},
			{view:'button',  inputWidth:scheduler.xy.icon_edit, name:"edit", id:"edit",align:"right",label:labels.icon_edit}
		];
	}
	if(!config.form_toolbar){
		config.form_toolbar = [
			{view:'label', width:scheduler.xy.icon_cancel, name:"cancel", id:"cancel",css:"cancel",align:"center",label:labels.icon_cancel},
			{view:'button', inputWidth:scheduler.xy.icon_save, name:"save", id:"save",align:"right",label:labels.icon_save}
		];
	}
	if(!config.date_toolbar){
		config.date_toolbar = [
			{view:'label', width:scheduler.xy.icon_cancel, name:"cancel_date", id:"cancel_date",css:"cancel",align:"center",label:labels.icon_cancel},
			{view:'label',id:"datetype",align:"center"},
			{view:'button', width: scheduler.xy.icon_done, name:"done", id:"done",align:"right",label:labels.icon_done}
		];
	}
	
	/*List types*/
	var listType = {
		cssNoEvents:"no_events",
		width:"auto",
		timeStart:templates.event_time,
		marker:templates.event_marker, 
		eventClass:templates.event_class
	};
	scheduler.types = {
		event_list:webix.extend({
			name:"EventsList",
			css:"events",
			headerHeight: scheduler.xy.list_header_height,

			height:scheduler.xy.list_height,
			templateHeader:templates.event_date,
			template:templates.event_title
		},listType),
		day_event_list:webix.extend({
			name:"DayEventsList",
			css:"day_events",
			height:scheduler.xy.month_list_height,
			template:templates.month_event_title
		},listType),
		multi_day_list: {
			name:"MultiDayEvents",
			height: 32,
			css:"multi_day_events",
			templateCss: scheduler.templates.event_class,
			templateStart:webix.template("<div webix_l_id='#id#' class='webix_list_item {common.templateCss()}' style='width:{common.widthSize()}; height:{common.heightSize()}; overflow:hidden;{common.templateColor()};'>"),
			template: templates.multi_day_event,
			templateColor: function(obj){
				return scheduler.templates.multi_day_event_style(obj);
			}
		}
	};
	webix.type(webix.ui.weekevents, scheduler.types.event_list);
	webix.type(webix.ui.list, scheduler.types.day_event_list);
	webix.type(webix.ui.list, scheduler.types.multi_day_list);

	webix.DataDriver.scheduler = {
	    records:"/*/event"
	};
	webix.extend(webix.DataDriver.scheduler,webix.DataDriver.xml);
    
	/*the views of scheduler multiview*/
	
	var tabViews = [
		{
			id:"day",
			rows:[
				{	
					id:"dayBar",
					view:"toolbar",
					css:"webix_topbar",
					cols: config.day_toolbar
				},
				{
					id:"multiDayList",
					view:"list",
					autoheight: true,
					type:"MultiDayEvents",
					yCount: config.multi_day_limit
				},
				{
					id:"dayList",
					view:"dayevents"
				}
			]
		},
		{
			id:"week",
			rows:[
				{
					id:"weekBar",
					view:"toolbar",
					css:"webix_topbar",
					elements: config.week_toolbar
				},
				{
					id: "weekEventsList",
					view:"weekevents",
					type:"EventsList",
					startDate:new Date(),
					noEvents: labels.label_no_events
				}
			]
		},
		{
			id:"month",
			view: "scrollview",
			body: {
				rows:[
					{
						id:"calendar",
						view:"calendar",
						width: 0,
						icons: false,
						minHeight: 310,
						dayWithEvents: templates.calendar_event,
						calendarHeader:config.calendar_date
					},
					{
						id:"calendarDayEvents",
						view:"list",
						height: "auto",
						scroll: false,
						type:"DayEventsList"
					}

				]
			}

		}
	].concat(config.tab_views);

	var delete_button = {view:"button", height:44,	label:labels.icon_delete,	id:'delete', type:"danger" ,css:"delete"};
	if(screen.width>500){
		delete_button.width = 300;
		delete_button = { type:"clean",cols:[{},delete_button,{}] };
	}

	var views = [
		{
			rows:[
				{
					view:"multiview",
					id:"tabViews",
					animate: (webix.env.touch?{}:false),
					cells: tabViews
				},
				{
					//view:"toolbar",
					id:"bottomBar",
					css: "webix_bottombar",
					height: 55,
					padding: 5,
					visibleBatch:"default",
					cols: config.bottom_toolbar
				}
			]
		},
		{
			id:"event",
			/*animate:{
				type:"slide",
				subtype:"in",
				direction:"top"
			},*/

			rows:[
				{
					id:"eventBar",
					view:"toolbar",

					css:"webix_subbar",
					elements: config.selected_toolbar
				},
				{
					type: "clean",
					paddingX: 10,
					rows:[
						{
							id:"eventTemplate",
							view:"template",
							css: "webix_event_view",
							template:templates.selected_event
						},
						delete_button,
						{	view:"template",height:20}
					]
				}

			]
		},
		{
			id:"form",
			rows:[
				{	
					id:"editBar",
					view:"toolbar",
					css: "webix_subbar",
					elements:config.form_toolbar
				},
				{
					id:"editForm",
					view:"form",
					scroll: true,
					elements: config.form,
					rules: config.form_rules
				}
			]
		},
		{
			id:"formdate",
			rows:[
				{	
				id:"dateBar",
					view:"toolbar",
					css: "webix_subbar",
					elements:config.date_toolbar
				},
				{
					id:"dateForm",
					type: "clean",
					rows:[
						{view:"calendar", height:310, timepickerHeight: 35,css:"form_calendar", icons: false, id:"formCalendar", width: "auto",  calendarTime:config.calendar_hour, timepicker:1,hourStart:0},
						{view:"template", css:"form_template"}
					] 
				}
			]
		}
	].concat(config.views);
	
	webix.protoUI({
		name:"scheduler",
		version:"3.2.2",
	    defaults:{
			rows:[
				{
					view:"multiview",
					id:"views",
					animate: (webix.env.touch?{}:false),
					cells: views
				}
			],
			color:"#color#",
			textColor:"#textColor#"
		},
		$init: function(){
	    	this.name = "Scheduler";
			this._viewobj.className += " webix_scheduler";
			/*date format functions*/
			webix.i18n.dateFormat = config.item_date;
			webix.i18n.weekDateFormat = config.week_date;
			webix.i18n.formDate = config.form_date;
			webix.i18n.formAllDayFormat = config.form_all_day;
    		webix.i18n.timeFormat = config.hour_date;
				
 		    webix.i18n.fullDateFormat = config.parse_date;
 		    webix.i18n.fullDateFormatUTC = config.server_utc;

		    webix.i18n.longDateFormat = config.all_day_date;
			webix.i18n.headerFormatStr = webix.Date.dateToStr( config.day_header_date);
			webix.i18n.headerWeekFormatStr = webix.Date.dateToStr( config.week_header_date);
			webix.i18n.loadDateFormat = config.dyn_load_date;

			webix.i18n._dateMethods = webix.i18n._dateMethods.concat(["formDate","formAllDayFormat","loadDateFormat","weekDateFormat"]);

			webix.i18n.setLocale();

			this.data.provideApi(this);
			this.data.scheme({
				$init:function(data){
					if(typeof data.start_date=="string")
						data.start_date	= webix.i18n.fullDateFormatDate(data.start_date);
					if(typeof data.end_date=="string")
						data.end_date 	= webix.i18n.fullDateFormatDate(data.end_date);
				},
				$update:function(data){
					if(typeof data.start_date=="string")
						data.start_date	= webix.i18n.fullDateFormatDate(data.start_date);
					if(typeof data.end_date=="string")
						data.end_date 	= webix.i18n.fullDateFormatDate(data.end_date);
				},
				$serialize:function(data){
					var obj = {};
					obj.start_date = webix.i18n.fullDateFormatStr(webix.Date.copy(data.start_date));
					obj.end_date = webix.i18n.fullDateFormatStr(webix.Date.copy(data.end_date));
					webix.extend(obj,data);
					return obj;
				}
			});
			this.$ready.push(this._initStructure);
		
			webix.callEvent("onAfterSchedulerInit",[this]);
			
	    },
	    syncData:function(target, start, end, filter){

	    	var events = this.getEvents(start, end);

			var tpull = target.data.pull = {};
	    	var torder = target.data.order = [];
		    events = this._correctEventsDates(start, events);
			for (var i=0; i<events.length; i++){
				if(!filter || filter.call(target, events[i], start, end)){
					var id = events[i].id;
					torder.push(id);
					tpull[id]=events[i];
				}
			}

	    },
		_syncAllViews:function(){	
			this.coreData.callEvent("onChange",[]);
			this.$$("multiDayList").getParentView().resize();
		},
		getWeekTitle: function(date){
			return scheduler.templates.week_title(date);
		},
		getTodayMultiEvents:function(){
			var scheduler = this.getTopParentView();
			var d = webix.Date.datePart(scheduler.coreData.getValue(),true);
			var next = webix.Date.add(d,1,"day",true);
			scheduler.syncData(this, d, next,function(ev){
				var dateStart = webix.Date.datePart(ev.start_date,true);
				var dateEnd = webix.Date.datePart(ev.end_date,true);
				return !webix.Date.equal(dateStart, dateEnd) && ev.start_date.valueOf()<=d.valueOf()&& ev.end_date.valueOf()>=next.valueOf();
			});
			this.resize();
		},
		getTodayEvents:function(){
			var scheduler = this.getTopParentView();
			var d = webix.Date.datePart(scheduler.coreData.getValue(),true);
			var next = webix.Date.add(d,1,"day",true);
			var filter = null;

			if(config.multi_day && scheduler.$$("dayList").isVisible())
				filter = function(ev){
					var dateStart = webix.Date.datePart(ev.start_date,true);
					var dateEnd = webix.Date.datePart(ev.end_date,true);
					return webix.Date.equal(dateStart, dateEnd) || ev.start_date.valueOf()>d.valueOf() || ev.end_date.valueOf()<next.valueOf();
				};
			scheduler.syncData(this, d, next, filter);
		},
		_setMonthFlags:function(old_Date, new_Date){
				if (!this.isVisible()) return;
				var top = this.getTopParentView();

				var start = webix.Date.datePart(webix.Date.copy(this.getVisibleDate()));
				start.setDate(1);
				var end = webix.Date.add(start,1,"month",true);

				top._eventsByDate = {};
				var events = top.getEvents(start, end);

				while(start<end){
					var next = webix.Date.add(start,1,"day",true);
					for (var i=0; i<events.length; i++)
						if (events[i].start_date < next && events[i].end_date > start )
							top._eventsByDate[start.valueOf()]=true;
					start = next;
				}
		},
	    _initStructure:function(){
			this._initToolbars();
			this._initMonth();

			//store current date
			this.coreData = new webix.DataValue();
			this.coreData.setValue(config.init_date);



			this.$$("dayList").define("date",this.coreData);
			
			this.selectedEvent = new webix.DataRecord();
			
			if(this.config.readonly){
				this.define("readonly",this.config.readonly);
			}
			else if(config.readonly)
				this.define("readonly",true);
			

			if(this.$$("date")){
				this.$$("date").setValue(webix.i18n.headerFormatStr(config.init_date));
				this.$$("date").config.label = this.$$("date").config.value;
				this.$$("date").bind(this.coreData, null, webix.i18n.headerFormatStr);
			}

		    if(this.$$("weekTitle")){
			    var weekTitle = this.getWeekTitle(config.init_date);
			    this.$$("weekTitle").setValue(weekTitle);
			    this.$$("weekTitle").config.label = weekTitle;
			    this.$$("weekTitle").bind(this.coreData, null, webix.bind(this.getWeekTitle,this));
		    }


			this.data.attachEvent("onStoreUpdated", this._sortDates);
			this.data.attachEvent("onStoreUpdated", webix.bind(this._syncAllViews, this));

			if(config.multi_day){
				this.$$("multiDayList").define("dataFeed", this.getTodayMultiEvents);
				this.$$("multiDayList").bind(this.coreData);
			}

		    this.$$("weekEventsList").bind(this.coreData);

			//custom data binding for day-list
			this.$$("dayList").define("dataFeed", this.getTodayEvents);
			this.$$("dayList").bind(this.coreData);

			this.$$("calendarDayEvents").define("dataFeed", this.getTodayEvents);
			this.$$("calendarDayEvents").bind(this.coreData);

			this.$$("calendar").bind(this.coreData);
			this.$$("calendar").attachEvent("onBeforeRender", this._setMonthFlags);
			/*to redraw calendar when coreDate got changed */
			this.coreData.attachEvent("onChange",webix.bind(function(){

				if(!this.$$("calendar")._zoom_level){
					if(this._load_mode&&this._load_url)
						this.load.apply(this,[this._load_url]);
					this.$$("calendar").render();
				}
			},this));
		    this.data.attachEvent("onClearAll", webix.bind(function(){
			    this._loaded_ranges = {};
		    },this));

			this.data.attachEvent("onIdChange",webix.bind(function(old,newId){
				this._syncAllViews();
			},this));
			
			this.$$("eventTemplate").bind(this);


			this.$$("weekEventsList").attachEvent("onItemClick", webix.bind(this._on_event_clicked, this));
			this.$$("dayList").attachEvent("onItemClick", webix.bind(this._on_event_clicked, this));
		    this.$$("multiDayList").attachEvent("onItemClick", webix.bind(this._on_event_clicked, this));
			this.$$("calendarDayEvents").attachEvent("onItemClick", webix.bind(this._on_event_clicked, this));

		    this.$$(config.mode||"week").show(false,false);
			this._initForm();

		},
		_initForm: function(){

			this.$$("editForm").bind(this);

			/*Start and End date selection*/
			this.dateField = new webix.DataValue();
			this.dateField.setValue("start_date");
			this.$$("datetype").bind(this.dateField, null, function(value){
				return (value == "start_date"?labels.label_start:labels.label_end);
			});

			this.$$("formCalendar").attachEvent("onAfterZoom",webix.bind(function(zoom){
				if(zoom){
					this.$$("cancel_date").hide();
				}
			},this));
			this.$$("formCalendar").attachEvent("onBeforeRender", webix.bind(function(){
				this.$$("cancel_date").show();
			},this));
		},
		_on_event_clicked:function(id){
			this._last_selected = (id||"").toString().split("#");
			if (this._last_selected[1])
				this.setCursor(null);
			this.setCursor(this._last_selected[0]);
			if(this.callEvent("onBeforeEventShow",[this._last_selected[0]]))
				this.$$('event').show();
			/*if(this._checkAllDay(this.$$("start_date").getValue())&&this._checkAllDay(this.$$("end_date").getValue())){
				this.$$("start_date").config.dateFormat = webix.i18n.formAllDayFormatStr;
				this.$$("end_date").config.dateFormat = webix.i18n.formDateOnlyFormatStr;
			}*/
		},
		/*Sorts dates asc, gets hash of dates with event*/
		_sortDates:function(){
			this.blockEvent();
			this.sort(function(a,b){
				return a.start_date < b.start_date?-1:1;
			});
			this.unblockEvent();
		},
		/* Month Events view: sets event handlers */
		_initMonth:function(){
			this.$$("calendar").attachEvent("onDateSelect",webix.bind(function(date){
				this.setDate(date);
			},this));

			this.$$("calendar").attachEvent("onAfterZoom",function(zoom){
				if(!zoom)
					this.callEvent("onBeforeMonthChange",[null,this._settings.date]);
			});
			this.$$("calendar").attachEvent("onBeforeMonthChange",webix.bind(function(oldDate, date){
				if(!this.$$("calendar")._zoom_level){
					var today = new Date();
					if(date.getMonth()===today.getMonth()&&date.getYear()===today.getYear())
						date = today;
					else
						date.setDate(1);

					if(this.$$("tabViews").config.animate){
						webix.ui.animateView(this.$$("month").getBody(), webix.bind(function(){
							this.setDate(date);
						},this), {type: "slide", direction: (oldDate < date ?"left":"right") });
					} else {
						this.setDate(date);
					}
				}
			},this));

			this.$$("calendar").config.dayTemplate = webix.bind(function(date){
				if(this._eventsByDate && this._eventsByDate[date.valueOf()])
					return this.$$("calendar").config.dayWithEvents(date);
				return date.getDate();
			},this);
		},
		getEvents:function(from,to){

			if (!to) to = new Date(9999,0,1);

			var result = [];
			var evs = this.data.getRange();

			for(var i = 0; i < evs.length;i++){
				if ((evs[i].start_date<to) && (evs[i].end_date>from))
					result.push(webix.copy(evs[i]));
			}

			return result;
		},
		_correctEventsDates: function(date,events){
			var event;
			var result = [];
			if(events)
				for(var i=0; i< events.length;i++){
					event = {
						start_date: webix.Date.copy(events[i].start_date),
						end_date: webix.Date.copy(events[i].end_date)
					};
					webix.extend(event,events[i]);
					if(event.start_date.valueOf()< date.valueOf()){
						event.start_date = webix.Date.add(webix.Date.datePart(event.start_date),1,"day",true);
					}
					var id = (id||"").toString().split("#");
					var endDate = event.rec_type?new Date(id[1]*1000+event.event_length*1000):event.end_date;
					if(endDate.valueOf()> webix.Date.add(date,1,"day",true).valueOf()){
						endDate = webix.Date.datePart(endDate);
						event.end_date = webix.Date.add(endDate,1,"day",true);
					}
					result.push(event);
				}
			return result;
		},
		/*applies selected date to all lists*/
		setDate:function(date, inc, mode){
			if (!date)
				date = this.coreData.getValue();
			else 
				date = webix.Date.datePart(date,true);

			if (inc)
				date = webix.Date.add(date, inc, mode, true);

			this.coreData.setValue(date);
		},
		_initToolbars:function(){
			this.attachEvent("onItemClick", function(id){
				
				var view_id = this.innerId(id);
				switch(view_id){
					case "today":
						this.setDate(new Date());	
						break;
					case "add":
						if(this.innerId(this.$$("views").getActiveId()) == "form"){
							var self = this;
							webix.confirm({
								height:scheduler.xy.confirm_height,
								width:scheduler.xy.confirm_width,
								title: labels.icon_close,
								message: labels.confirm_closing,
								callback: function(result) {
									if (result){
										self._addEvent();
									}
								},
								ok:labels.icon_yes,
								cancel:labels.icon_no,
								css:"confirm"
				
							});
						}else{
							this._addEvent();
						}
						break;
					case "prev":
						this.setDate(null, -1, "day");
						break;
			    	case "next":
			    		this.setDate(null, 1, "day");
			    		break;
					case "prevWeek":
						this.setDate(null, -1, "week");
						break;
					case "nextWeek":
						this.setDate(null, 1, "week");
						break;
			    	case "edit":
					    this._editEvent();
						break;
					case "cancel_date":
					case "back":
						this.$$("views").back();
						break;
					case "cancel":
						/*if(!this.config.editEvent)
							this.remove(this.getCursor());*/
						this.callEvent("onAfterCursorChange",[this.getCursor()]);
						this.$$("views").back();
						break;
					case "save":
						this._saveEvent();
						break;
					case "delete":
						this._deleteEvent();
						break;
					case "start_date":
					case "end_date":
					    if(this.$$(view_id).name == "datetext")
							this._showDateForm(view_id);
						break;
					case "done":
						if(this.$$("formCalendar")._zoom_level){
							this.$$("formCalendar").selectDate(this.$$("formCalendar").config.date,true);
						}
						else{
							var field = this.dateField.getValue();
							var date = this.$$("formCalendar").getValue();
							this.$$(field).setValue(date);
							this._setDefaultDates();
							this.$$("views").back();
							this.$$("editForm").validate();
						}

						break;
					case "allDay":
						this._setAllDay();
						break;
					default:
						//do nothing
						break;
				}		
			});
			this.attachEvent("onAfterTabClick", function(id, button){
				this.$$(button).show();
			});
			this.attachEvent("onBeforeTabClick", function(id, button){
				return this._confirmViewChange(button);
			});
		},
		readonly_setter:function(val){
			if(this.$$("add")){
			if (val){
					this.$$("bottomBar").showBatch("readonly");
					this.$$("add").hide();
					this.$$("edit").hide();
					this.$$("delete").hide();
				}
				else{
					this.$$("bottomBar").showBatch("default");
					this.$$("add").show();
					this.$$("edit").show();
					this.$$("delete").show();
				}
			}
			return val;
		},
		/*removes "No events" background*/
		_clearNoEventsStyle:function(){
			if(this.dataCount())
				this._viewobj.className = this._viewobj.className.replace(RegExp(this.type.cssNoEvents, "g"),"");
			else 
				this._viewobj.className += " "+this.type.cssNoEvents;
		},
		_saveEvent: function(){
			//alert(this.$$("editForm").validate())
			if(this.$$("editForm").validate()){
				if(!this.config.editEvent){
					var data = this.$$("editForm").getValues();
					data.id = webix.uid();
					if(data.details&&this._trim(data.text)===""&&this._trim(data.details)!=="")
						data.text = data.details;
					this.add(data);
					this.setCursor(data.id);
				} else {
					this.$$("editForm").save();
				}
				//webix.dp(this).save();
				this.setDate();
				this.$$("views").back();
			}
		},
		/*deletes the cursored event*/
		_deleteEvent: function(){
			var self = this;
			webix.confirm({
				height:scheduler.xy.confirm_height,
				width:scheduler.xy.confirm_width,
				title: labels.icon_delete,
				text: labels.confirm_deleting,
				callback: function(result) {
					if (result){
						self.remove(self.getCursor());
						self.setDate();
						self.$$("views").back(1);
						
					}
				},
				ok:labels.icon_yes,
				cancel:labels.icon_no,
				css:"confirm",
				header:false
			});
		},
		/*adds the new event*/
		_addEvent:function(){
			/*if(this.$$("delete"))
				this.$$("delete").hide();*/
			this.define("editEvent",false);				
			this.$$("form").show();
			
			
			this.$$("editForm").clear();
			this.$$("editForm").clearValidation();
			this.$$("editForm").setValues(templates.new_event_data.call(this));
			this._setDefaultDates();
		},
		eventDefaultDate:function(){
			
		},
		/* edit selected event*/
		_editEvent: function(){
			if(this.$$("delete"))
				this.$$("delete").show();
			this.define("editEvent",true);
			this.$$("form").show();
			if(this.$$("rec_type"))
				this.$$("rec_type").setValue(this.$$("rec_type").getValue(),true);
			this._setDefaultDates();
		},
		/*cofirm the view changing (necessary for edit form)*/
		_confirmViewChange:function(button){
			if(this.innerId(this.$$("views").getActiveId()) == "form"){
				var self = this;
				if(button!= "today")
					webix.confirm({
						height:scheduler.xy.confirm_height,
						width:scheduler.xy.confirm_width,
						title: labels.icon_close,
						text: labels.confirm_closing,
						callback: function(result) {
							if (result){
								self.$$(button).show();
								self.$$("buttons").setValue(button);
							}
						},
						labelOk:labels.icon_yes,
						labelCancel:labels.icon_no,
						css:"confirm"
					});
				return false;
			}
			return true;
		},
		/*converts event dates for strings before they are sent*/
		/*_onSchedulerUpdate:function(data){
		    var i, obj;
			for(i = 0; i < data.length; i++){
				obj = data[i].data;
				obj.start_date = webix.i18n.fullDateFormatStr(obj.start_date);
				obj.end_date = webix.i18n.fullDateFormatStr(obj.end_date);
			}
		},*/
		/*displayes calendar for form dates*/
		_showDateForm:function(name){
			this.dateField.setValue(name);
			if(this.$$("editForm").elements["allDay"])
				this.$$("formCalendar").define("timepicker", !this.$$("editForm").elements["allDay"].getValue());
			this.$$("formdate").show();
			webix.delay(function(){
				this.$$("formCalendar").resize();
				this.$$("formCalendar").selectDate(webix.Date.copy(this.$$(name).getValue()),true);
			},this);
		},
		/*checks time of the date*/
		_checkAllDay:function(date){
			return date.valueOf()== webix.Date.datePart(date,true).valueOf();
		},
		/*onclick handler for addDay toggle*/
		_setAllDay:function(){
			var format = (this.$$("allDay").getValue()=="1"?webix.i18n.formAllDayFormatStr:webix.i18n.formDateStr);
			var elements = this.$$("editForm").elements;
			var fields = [this.$$("start_date"),this.$$("end_date")];
			for(var i=0;i<2;i++){
				fields[i].config.dateFormatStr = format;
				if(elements["allDay"].getValue()!=1)
					fields[i].setValue(this._event_date[i],true);
			}
			if(elements["allDay"].getValue()==1){
				fields[0].setValue(webix.Date.datePart(this._event_date[0],true),true);
				var end = webix.Date.datePart(this._event_date[1],true);
				if(end.valueOf()<=fields[0].getValue().valueOf())
				   end = webix.Date.add(end,1,"day",true);
				 fields[1].setValue(end,true);
			}
		},
		/*called when editing form is shown. Creates copies of event dates and set allDay state*/
		_setDefaultDates:function(){
			this._event_date = [];
			var elements = this.$$("editForm").elements;
			this._event_date[0] = this.$$("start_date").getValue();
			this._event_date[1] = this.$$("end_date").getValue();
			var value = (this._checkAllDay(this._event_date[0])&&this._checkAllDay(this._event_date[1])&&(this._event_date[1].valueOf()>this._event_date[0].valueOf())?1:0);
			if(!elements["allDay"])
			   return;
			elements["allDay"].setValue(value);
			var format = (elements["allDay"].getValue()?webix.i18n.formAllDayFormatStr:webix.i18n.formDateStr);
			var fields = [this.$$("start_date"),this.$$("end_date")];
			for(var i=0;i<2;i++){
				fields[i].config.dateFormatStr = format;
				fields[i].setValue(this._event_date[i],true);

			}
		},
		/*remove leading and end whitespaces*/
		_trim: function(value) {
			value = value.replace(/^ */g, '');
			value = value.replace(/ *$/g, '');
			return value;
		},
		setLoadMode:function(mode){
			if (mode=="all") mode="";
			this._load_mode=mode;
		},
		_loaded_ranges:{},
		load: function(url){
			this._load_url = url;
			var args = arguments;
			if (this._load_mode && typeof url == "string"){
				url+=(url.indexOf("?")==-1?"?":"&")+"timeshift="+(new Date()).getTimezoneOffset();
				var to;
				var from= from||this.coreData.getValue();
				var lf =  webix.i18n.loadDateFormatStr;

				from = webix.Date[this._load_mode+"Start"](new Date(from.valueOf()));
				to = from;

				to=webix.Date.add(to,1,this._load_mode,true);
				if (this._loaded_ranges[lf(from)])
					from=webix.Date.add(from,1,this._load_mode,true);

				var temp_to=to;
				do {
					to = temp_to;
					temp_to=webix.Date.add(to,-1,this._load_mode,true);
				} while (temp_to>from && this._loaded_ranges[lf(temp_to)]);

				if (to<=from)
					return false; //already loaded
				args[0] = url+"&from="+lf(from)+"&to="+lf(to);

				while(from<to){
					this._loaded_ranges[lf(from)]=true;
					from=webix.Date.add(from,1,this._load_mode,true);
				}
			}
			webix.DataLoader.prototype.load.apply(this,args);
		}
	}, webix.IdSpace, webix.DataLoader, webix.ui.layout, webix.EventSystem, webix.Settings);
});

/*DHX:Depend scheduler_recurring.css*/

(function(){

var labels = scheduler.locale.labels;
var xy = scheduler.xy;
var config = scheduler.config;
var templates = scheduler.templates;

config.recurring = false;
config.endless_date = new Date(9999,1,1);
config.recurring_dialogs = false;

labels.recurring = {
	none:"Never",
	daily:"Daily",
	day:"day(s)",
	every:"Every",
	weekly: "Weekly",
	week:"week(s) on",
	each:"Each",
	on_day: "on the",
	monthly: "Monthly",
	month: "month(s)",
	month_day:"on what day of the month",
	week_day:"on what day of the week",
	yearly: "Yearly",
	year: "year(s) in",
	counters:["the first","the second","the third", "the fourth", "the fifth"],
	never:"Never",
	repeat:"Repeat",
	end_repeat:"End repeat",
	endless_repeat:"Endless repeat",
	end_repeat_label: "Repeat will end by",
	edit_message: "Do you want to edit the whole set of repeated events?",
	edit_series: "Edit series",
	edit_occurrence: "Edit occurrence",
	delete_message: "Do you want to delete the whole set of repeated events?",
	delete_series: "Delete series",
	delete_occurrence: "Delete occurrence"
};
xy.recurring = {
	label_end_repeat: 140,
	label_end_by: 240,
	label_every: 65,
	work_days:180
};




	
webix.protoUI({
	name:"datecells",
	defaults:{
		css: "webix_datecells",
		x_count:7,
		cellHeight:36
	},
	_id:"webix_d_c",
	$init:function(){
		this._dataobj = this._viewobj;
	},
	on_click:{
		webix_cal_day_num:function(e,id){
			if(id)
			this.define("activeCell",id);
		}
	},
	activeCell_setter:function(id){
		this._settings.activeCell = id;
		this.render();
		return id;
	},
	render:function(){
		if(this.isVisible(this._settings.id)){
			var c = 1;
			var html = '<table cellspacing="0" cellpadding="0" class="webix_rec_table"><tbody>';
			var obj = this._settings.data;
			var cellWidth = (this.$width/this._settings.x_count);
			
			for(var i in obj){
				var style = "";
				var className = "webix_cal_day_num";

				style += ";height:"+this._settings.cellHeight+"px;line-height:"+this._settings.cellHeight+"px;";
				if(c%this._settings.x_count==1)
					html += "<tr>";
				html += "<td style='"+(cellWidth?("width:"+cellWidth+"px"):"")+"'>";
				
				if(this._settings.activeCell==i)
					className+=" webix_cal_selected_day";
				
				html += "<div webix_d_c='"+i+"' class='"+className+"' style='"+style+"'>"+obj[i]+"</div>";
				html += "</td>";
				if(c%this._settings.x_count===0)
					html += "</tr>";
		   		c++;
		  	}
			var top_style="overflow: hidden;";
		    html += "</tbody></table>";
			this._viewobj.innerHTML = html;
		}
	},
	$setSize:function(x,y){
    	if(webix.ui.view.prototype.$setSize.call(this,x,y)){
    		this.render();
    	}
 	},
	setValue:function(value){
		this.define("activeCell",value);
	},
	getValue:function(){
		return this._settings.activeCell;
	}
}, webix.MouseEvents, webix.ui.view, webix.EventSystem);





webix.protoUI({
	name:"rectext",
	$setValue:function(value){

		this._settings.value = (value||"");
		var type = "none";
		var recView = this.getTopParentView().$$("recurring");
		var arr = this._settings.value.split("_");
		if(arr[0]!=="")
			type = recView._settings.typeToId[arr[0]];
		this._settings.text = this.getInputNode().innerHTML = labels.recurring[type];
	}
}, webix.ui.datetext);
webix.protoUI({
	name:"endrec",
	setValue: function(value){
		var skipEvent = false;
		var oldvalue = this._settings.value;
		if (oldvalue == value){
			skipEvent = true;
		}
		else{
			this._settings.value = value;
		}
		if (this._rendered_input)
			this.$setValue(value);
		if(!skipEvent)
			this.callEvent("onChange", [value, oldvalue]);
	},
	$setValue:function(date){
		this._settings.value = (date||"");
		var recView = this.getTopParentView().$$("recurring");
		var text;
		if(typeof date=="object"){
			if(date.valueOf()==recView._settings.endlessDate.valueOf())
				text = labels.recurring.never;
			else
				text = (this._settings.dateFormatStr||webix.i18n.dateFormatStr)(this._settings.value);
		}
		this._settings.text = this.getInputNode().innerHTML = (text||this._settings.value);
	}
}, webix.ui.datetext);

webix.protoUI({
	name:"reclist",
	defaults:{
		//padding:10
	},
	$init:function(){
		this.$view.className += " webix_reclist";
	},
	/*$setSize:function(x,y){
		if (webix.ui.view.prototype.$setSize.call(this,x,y)){
			if(this._settings.padding){
				//this.$view.style.padding = this._settings.padding+"px";
				this._dataobj.style.width = this._content_width-this._settings.padding*2+"px";
				this._dataobj.style.height = this._content_height-this._settings.padding*2+"px";
			}
		}
	},*/
	setValue:function(value){
		if(this.getItem(value))
			this.select(value);
	},
	getValue:function(){
		return this.getSelected();
	}
},webix.ui.list);

/*webix.ui.daily*/
webix.protoUI({
	name:"daily",
	setValue:function(data){
		if(typeof data == "object"&&data[0]=="day"){
			  if(!data[1]||data[1]==="")
				data[1] = 1;
			this.setValues({dayCount:data[1]});
		}
	},
	getValue:function(){
		var data = this.getValues();
		return ["day",data["dayCount"],"","","",""];
	}
}, webix.ui.form);

/*webix.ui.weekly*/
webix.protoUI({
	name:"weekly",
	setValue:function(data){
		if(typeof data == "object"&&data[0]=="week"){
			if(!data[1]&&data[1]==="")
				data[1] = 1;
		    if(!data[4]||data[4]==="")
				data[4] = (data[5].getDay()+6)%7+1;

			this.setValues({weekCount:data[1],weekDays:""+data[4]});
		}
	},
	getValue:function(){
		var data = this.getValues();
		if(!data["weekDays"])
			data["weekDays"] = 1;
		return ["week",data["weekCount"],"","",data["weekDays"],""];
	}
}, webix.ui.form);

/*webix.ui.monthly*/
webix.protoUI({
	name:"monthly",
	defaults:{
		css: "webix_monthly"
	},
	setValue:function(data){
		if(typeof data == "object"&&data[0]=="month"){
			var topParent = this.getTopParentView();
			if(!data[1]&&data[1]==="")
				data[1] = 1;
			if(data[2]&&data[2]!=="")
				topParent.$$("typeWeekM").expand();
			else{
				data[2] = (data[5].getDay()+6)%7+1;
				data[3] = Math.ceil(data[5].getDate()/7);
			}	
			this.setValues({monthCount:data[1],weekDayM:data[2],weekCountM:data[3],monthDayM:data[5].getDate()});
		}
	},
	getValue:function(){
		var data = this.getValues();
		var res = ["month",data["monthCount"],"","","",""];
		var topParent = this.getTopParentView();
		if(topParent.$$("typeDayM")._settings.collapsed){
		   res[2] = data["weekDayM"];
		   res[3] = data["weekCountM"];
		}
		else{
		   res[5] = data["monthDayM"];
		}
		return res;
	}
}, webix.ui.form);

/*webix.ui.yearly*/
webix.protoUI({
	name:"yearly",
	defaults:{
		css: "webix_yearly"
	},
	setValue:function(data){
		if(typeof data == "object"&&data[0]=="year"){
			var topParent = this.getTopParentView();
			if(!data[1]&&data[1]==="")
				data[1] = 1;
			if(data[2]&&data[2]!=="")
				topParent.$$("typeWeekY").setValue(1);
			else{
				topParent.$$("typeWeekY").setValue(0);
				data[2] = (data[5].getDay()+6)%7+1;
				data[3] = Math.ceil(data[5].getDate()/7);
			}
			topParent.$$("typeWeekY").callEvent("onItemClick",[]);
			this.setValues({yearCount:data[1],weekDayY:data[2],weekCountY:data[3],monthDayY:data[5].getMonth()});
		}
	},
	getValue:function(){
		var data = this.getValues();
		var res = ["year",data["yearCount"],"","","",""];
		var topParent = this.getTopParentView();
		if(topParent.$$("typeWeekY").getValue()){
		   res[2] = data["weekDayY"];
		   res[3] = data["weekCountY"];
		}
		res[5] = data["monthDayY"];
		return res;
	}
}, webix.ui.form);

webix.protoUI({
	name:"rec_dialog",
	defaults:{
		height:210,
		css: "webix_scheduler dialog",
		head: false,
		body:{
			type:"clean",
			rows:[
				{id: "webix_confirm_message",  template: "<div class='webix_dialog_text'>#text#</div>",
					data:{ text: "You have forgot to define the text :) " }
				},
				{	height:44, view:"button", label:"Series", click:function(){
						this.getParentView().getParentView()._callback(1);
					}
				},
				{ 	height:44, view:"button", label:"Occurrence", click:function(){
						this.getParentView().getParentView()._callback(2);
					}
				},
				{	height:44, view:"button", css: "cancel", label:"Cancel", click:function(){
						this.getParentView().getParentView()._callback(false);
					}
				}
			]
		}
	},
	labelSeries_setter:function(value){
		var body = this._body_cell._cells[1];
		body.config.label = value;
		body.render();
	},
	labelEvent_setter:function(value){
		var body = this._body_cell._cells[2];
		body.config.label = value;
		body.render();
	},
	labelCancel_setter:function(value){
		var body = this._body_cell._cells[3];
		body.config.label = value;
		body.render();
	}
},webix.ui.alert);
webix.rec_dialog = webix.single(webix.ui.rec_dialog);

webix.attachEvent("onAfterSchedulerInit", function(scheduler){
	/*scheduler.data.extraParser = webix.bind(function(data){
		data.start_date	= webix.i18n.fullDateFormatDate(data.start_date);
		data.end_date 	= webix.i18n.fullDateFormatDate(data.end_date);
	},scheduler);*/
	if(!config.recurring) return false;

	webix.delay(function(){
		scheduler.$$('editForm').define("dataFeed", function(data){
			data = webix.copy(this.getTopParentView().getItem(data));
			delete data.id;
			if (data.rec_type){
				data.endRepeat = data.end_date;
				data.end_date = new Date(data.start_date.valueOf()+data.event_length*1000);
			}
			this.setValues(data);
		});	
		scheduler.$$('editForm').getValueBase = scheduler.$$('editForm').getValues;
		scheduler.$$('editForm').getValues = function(){
			var data = this.getValueBase();
			if (data.rec_type){
				data.event_length = Math.round((data.end_date - data.start_date) / 1000);
				data.end_date = data.endRepeat||data.end_date;
			}
			return data;
		};
	});

	scheduler.getEventsBase = scheduler.getEvents;
	scheduler.getEvents = function(from,to){
		to = to||webix.Date.add(from, 1, "month",true);

		var evs = this.getEventsBase(from, to);
		var out = [];
		for (var i = 0; i < evs.length; i++){
			if (evs[i].rec_type)
				this.repeat_date(evs[i], out, from, to);
			else
				out.push(evs[i]);
		}

		out.sort(function(a,b){
			a = a.start_date;
			b = b.start_date;
			return a>b?1:(a<b?-1:0);
		});
		return out;
	};
	scheduler._saveEventBase = scheduler._saveEvent;
	scheduler._saveEvent = function(){
		if(!this._settings.editEvent && this.$$("editForm").validate()){
			var data = this.$$("editForm").getValues();
			if(data.event_pid){
				data.id = webix.uid();
				if(data.details&&this._trim(data.text)===""&&this._trim(data.details)!=="")
					data.text = data.details;

				data.event_length = data.start_date.valueOf()/1000;
				this._add_rec_marker(data,data.start_date.valueOf());
				this.add(data);
				this.setCursor(data.id);
				this.setDate();
				this.$$("views").back();
				return true;
			}
		}
		this._saveEventBase.call(this);
	};

	scheduler._editEventBase = scheduler._editEvent;
	scheduler._editEvent = function(){
		var item = this.getItem(this.getCursor());
		if((item.rec_type || item.event_pid) && config.recurring_dialogs){
			webix.rec_dialog({
				height:xy.confirm_height,
				width:xy.confirm_width,
				message: labels.recurring.edit_message,
				callback: function(result) {
					if (result == 1){
						if(item.event_pid)
							scheduler.setCursor(item.event_pid);
						scheduler._editEventBase.call(scheduler);
					}
					else if (result == 2)
						scheduler._applyRecExeption("edit");
				},
				labelSeries:labels.recurring.edit_series,
				labelEvent:labels.recurring.edit_occurrence,
				labelCancel:labels.icon_cancel

			});
		}
		else
			scheduler._editEventBase.call(this);
	};
	scheduler._deleteEventBase = scheduler._deleteEvent;
	scheduler._deleteEvent = function(){
		var item = this.getItem(this.getCursor());
		if((item.rec_type || item.event_pid) && config.recurring_dialogs){
			webix.rec_dialog({
				height:xy.confirm_height,
				width:xy.confirm_width,

				message: labels.recurring.delete_message,
				callback: function(result) {
					if (result == 1){
						scheduler.remove(scheduler.getCursor());
						scheduler.setDate();
						scheduler.$$("views").back(1);
					}
					else if (result == 2)
						scheduler._applyRecExeption("remove");
				},
				labelSeries:labels.recurring.delete_series,
				labelEvent:labels.recurring.delete_occurrence,
				labelCancel:labels.icon_cancel

			});
		}
		else
			scheduler._deleteEventBase.call(this);
	};


	scheduler._applyRecExeption = function(mode){
		if( mode == "edit" ){
			var data = webix.copy(this.getItem(this.getCursor()));

			if(data.rec_type){
				this.define("editEvent",false);

				if(this.$$("rec_type") && !this.$$("rec_type").config.hidden)
					this._recTypeState = "hide";

				this.$$("form").show();

				this.$$("editForm").clear();

				data.event_pid = data.id;
				var id = this._last_selected;

				if (!id && !id[1])
					return scheduler._editEventBase.call(this);

				var sd = data.start_date;
				var ed = data.end_date;
				data.start_date = new Date(id[1]*1000);
				data.end_date = new Date(id[1]*1000+data.event_length*1000);

				delete data.id;

				data.rec_type = data.rec_pattern = "";

				data.end_date = new Date(data.start_date.valueOf()+data.event_length*1000);
				this.$$("editForm").setValues(data);
				this._setDefaultDates();
			}
			else
				scheduler._editEventBase.call(this);
		}
		else if( mode == "remove" ){
			var data = webix.copy(this.getItem(this.getCursor()));
			data.event_pid = data.id;
			var id = this._last_selected;

			if (!id || !id[1])
				return ;

			var sd = data.start_date;
			var ed = data.end_date;

			data.start_date = new Date(id[1]*1000);
			data.end_date = new Date(id[1]*1000+data.event_length*1000);

			data.id = webix.uid();
			data.rec_type = data.rec_pattern=  "none";

			data.end_date = new Date(data.start_date.valueOf()+data.event_length*1000);
			data.event_length = data.start_date.valueOf()/1000;

			this._add_rec_marker(data,data.start_date.valueOf());
			this.add(data);
			//this.setCursor(data.id);
			this.setDate();
			this.$$("views").back();
		}
	};


	scheduler._rec_markers = {};
	scheduler._rec_markers_pull = {};
	scheduler._add_rec_marker = function(ev,time){
		ev._pid_time = time;
		this._rec_markers[ev.id] = ev;
		if (!this._rec_markers_pull[ev.event_pid]) this._rec_markers_pull[ev.event_pid] = {};
		this._rec_markers_pull[ev.event_pid][time]=ev;
	};
	scheduler._get_rec_marker = function(time, id){
		var ch = this._rec_markers_pull[id];
		if (ch) return ch[time];
		return null;	 
	};
	scheduler._get_rec_markers = function(id){
		return (this._rec_markers_pull[id]||[]);	
	};

	scheduler.data.scheme({
		$init:function(data){
			if(typeof data.start_date == "string")
				data.start_date	= webix.i18n.fullDateFormatDate(data.start_date);
			if(typeof data.end_date == "string")
				data.end_date 	= webix.i18n.fullDateFormatDate(data.end_date);

			if (data.event_pid)
				scheduler._add_rec_marker(data, data.event_length*1000);
		},
		$serialize:function(data){
			var obj = {};
			obj.start_date = webix.i18n.fullDateFormatStr(webix.Date.copy(data.start_date));
			obj.end_date = webix.i18n.fullDateFormatStr(webix.Date.copy(data.end_date));
			webix.extend(obj,data);
			return obj;
		}
	});
	

	scheduler.transponse_size={
		day:1, week:7, month:1, year:12 
	};
	scheduler.day_week=function(sd,day,week){
		sd.setDate(1);
		week = (week-1)*7;
		var cday = sd.getDay();
		var nday=(day==7?0:(day*1))+week-cday+1;
		sd.setDate(nday<=week?(nday+7):nday);
	};
	scheduler.transpose_day_week=function(sd,list,cor,size,cor2){
		var cday = (sd.getDay()||(webix.Date.startOnMonday?7:0))-cor;
		for (var i=0; i < list.length; i++) {
			if (list[i]>cday)
				return sd.setDate(sd.getDate()+list[i]*1-cday-(size?cor:cor2));
		}
		scheduler.transpose_day_week(sd,list,cor+size,null,cor);
	};	
	scheduler.transpose_type = function(type){
		var f = "transpose_"+type;
		if (!webix.Date[f]) {
			var str = type.split("_");
			var day = 60*60*24*1000;
			var step = scheduler.transponse_size[str[0]]*str[1];
			
			if (str[0]=="day" || str[0]=="week"){
				var days = null;
				if (str[4]){
					days=str[4].split(",");
					if (webix.Date.startOnMonday){
						for (var i=0; i < days.length; i++)
							days[i]=(days[i]*1)||7;
						days.sort();
					}
				}
				
				
				webix.Date[f] = function(nd,td){
					var delta = Math.floor((td.valueOf()-nd.valueOf())/(day*step));
					if (delta>0)
						nd.setDate(nd.getDate()+delta*step);
					if (days)
							scheduler.transpose_day_week(nd,days,1,step);
				};
				webix.Date.add[type] = function(nd,inc){
					if (days){
						for (var count=0; count < inc; count++)
							scheduler.transpose_day_week(nd,days,0,step);	
					} else
						nd.setDate(nd.getDate()+inc*step);
					
					return nd;
				};
			}
			else if (str[0]=="month" || str[0]=="year"){
				webix.Date[f] = function(nd,td){
					var delta = Math.ceil(((td.getFullYear()*12+td.getMonth()*1)-(nd.getFullYear()*12+nd.getMonth()*1))/(step));
					if (delta>=0)
						nd.setMonth(nd.getMonth()+delta*step);
					if (str[3])
						scheduler.day_week(nd,str[2],str[3]);
				};
				webix.Date.add[type] = function(nd,inc){
					nd.setMonth(nd.getMonth()+inc*step);
					if (str[3])
						scheduler.day_week(nd,str[2],str[3]);
					return nd;
				};
			}
		}
	};
	scheduler.data.attachEvent("onStoreUpdated", function(id, data, mode){
		if (mode == "delete" || mode == "update" || (mode == "insert" && !data.rec_type && data.event_pid)){
			this.blockEvent();
			var sub = scheduler._get_rec_markers(id);
            scheduler._rec_markers_pull[id] = null;
			for (var i in sub) {
			    if(sub.hasOwnProperty(i)){
				    id = sub[i].id;
				    if(this.getItem(id))
					    this.remove(id);
				}
			}
			this.unblockEvent();
		}

	});
	scheduler.repeat_date=function(ev,stack,from,to){
		if (ev.rec_type == "none")
			return;

		var td = new Date(ev.start_date.valueOf());
		ev.rec_pattern = ev.rec_type.split("#")[0];
		
		scheduler.transpose_type(ev.rec_pattern);
		webix.Date["transpose_"+ev.rec_pattern](td, from);
		
		while (td<ev.start_date || (td.valueOf()+ev.event_length*1000)<=from.valueOf())
			td = webix.Date.add(td,1,ev.rec_pattern,true);
		while (td < to && td < ev.end_date){
			var ch = this._get_rec_marker(td.valueOf(),ev.id);
			if (!ch){
				var ted = new Date(td.valueOf()+ev.event_length*1000);
				var copy=webix.copy(ev);
				//copy._timed = ev._timed;
				copy.text = ev.text;
				copy.start_date = td;
				copy.event_pid = ev.id;
				copy.id = ev.id+"#"+Math.ceil(td.valueOf()/1000);
				copy.end_date = ted;
	     
				var shift = copy.start_date.getTimezoneOffset() - copy.end_date.getTimezoneOffset();
				if (shift){
					if (shift>0) 
						copy.end_date = new Date(td.valueOf()+ev.event_length*1000-shift*60*1000);
					else {
						copy.end_date = new Date(copy.end_date.valueOf() + shift*60*1000);
					}
				}
								
				stack.push(copy);
			}
			td = webix.Date.add(td,1,ev.rec_pattern,true);
		}		
	};

});


webix.attachEvent("onBeforeSchedulerInit",function(){
	if(!config.recurring) return true;

	if(!config.form){
		config.form = [
			{view:"text",		label:labels.label_event,	name:'text', labelWidth: 90},
			{view:"datetext",	label:labels.label_start,	id:'start_date',	name:'start_date', dateFormat:config.form_date, labelWidth: 90},
			{view:"datetext",	label:labels.label_end,		id:'end_date',		name:'end_date', 	  dateFormat:config.form_date, labelWidth: 90},
			{view:"checkbox",	id:'allDay',	name:'allDay', label:labels.label_allday,  value:0, labelWidth: 100},
			{view:"rectext",	label:labels.recurring.repeat,	id:'rec_type',	name:'rec_type', readonly:true, labelWidth: 90},
			{view:"textarea",	label:labels.label_details,	id:'details',	name:'details',		height:110, labelWidth: 90},
			{view:"text",	hidden: true, id:'event_length', name:'event_length'}
		];
	}
		
	if(!config.recurring_bar){
		config.recurring_bar = [
			{view:'label', width:xy.icon_cancel, id:"recCancel", name:"recCancel",css:"cancel",align:"center",label:labels.icon_cancel,batch:"default"},
			{view:'label', width:xy.icon_cancel, id:"recEndCancel", name:"recEndCancel", css:"cancel",align:"center",label:labels.icon_cancel,batch:"endRepeat"},
			{},
			{view:'button', width:xy.icon_done, id:"recDone", name:"recDone",align:"right",label:labels.icon_done,batch:"default"},
			{view:'button', width:xy.icon_done, id:"recDone2", name:"recDone2", align:"right",label:labels.icon_done,batch:"other"},

			{view:'button', width:xy.icon_done, id:"recEndDone", name:"recEndDone", align:"right",label:labels.icon_done,batch:"endRepeat"}
		];
	}
	/*list of recurring types in the first view*/
	if(!config.recurring_views_list)
		config.recurring_views_list = [
				{id:"none",value:labels.recurring.none, readonly:true},
				{id:"daily",value:labels.recurring.daily},
				{id:"weekly",value:labels.recurring.weekly},
				{id:"monthly",value:labels.recurring.monthly},
				{id:"yearly",value:labels.recurring.yearly}
		];
	if(!scheduler.templates.rec_list_item){
		scheduler.templates.rec_list_item = function(obj, common){
			return obj.value +(!obj.readonly?"<div class='webix_arrow_icon'></div>":"");
		};
	}
    /* the initial view, the with "repeat" options*/
	if(!config.rec_init_form)
		config.rec_init_form = [
			{height:10},
			{view:"reclist",id:"recList", autoheight: true, scroll: false, select:true,css:"rec_list",value:"none",template:scheduler.templates.rec_list_item, datatype:"json",data:config.recurring_views_list, labelWidth:100},
			{ maxHeight: 42},

			{view:"endrec", id:"endRepeat", name:"endRepeat", labelWidth:xy.recurring.label_end_repeat,  label:labels.recurring.end_repeat},

			{}
		];
	if(!config.end_repeat_form)
		config.end_repeat_form = [
			{
				type:"clean",
				paddingX: 10,
				paddingY: 5,
				cols:[
					{view:"radio", css:"webix_endby_radio",vertical:true, id:"endBy",width:290, labelWidth:xy.recurring.label_end_by, height:80, options:[
						{ value:labels.recurring.endless_repeat, id: "0" },
						{ value:labels.recurring.end_repeat_label, id: "1" }
					]},
					{}
				]
			},
			{view:"calendar", id:"endByDate", width:0, css:"end_rep_calendar",icons: false},{}
		];
	 /*Daily view*/
    if(!config.daily_form)
		config.daily_form = [

			{
				type:"clean",
				css: "webix_rec_counter",
				cols:[
					{view:"label", label:labels.recurring.every,width:xy.recurring.label_every},
					{view:"counter", id:"dayCount", name:"dayCount", value:1,width:125},
					{view:"label", label:labels.recurring.day}
				]
			},
			{}
		];

	templates.selected_event_base = templates.selected_event;
	templates.selected_event = function(ev,common){
		if (!ev.rec_type)
			return templates.selected_event_base(ev);
		else{
			var id = common.getTopParentView()._last_selected;

			if (!id || !id[1])
				return templates.selected_event_base(ev);

			var sd = ev.start_date;
			var ed = ev.end_date;
			ev.start_date = new Date(id[1]*1000);
			ev.end_date = new Date(id[1]*1000+ev.event_length*1000);

			var html = templates.selected_event_base(ev);

			ev.start_date = sd;
			ev.end_date = ed;
			return html;
		}
	};

	/*Weekly view*/
	webix.protoUI({
		name:"weeklist",
		defaults:{
			css: "webix_weeklist",
			elementsConfig: {labelWidth: 2},
			rows:[
				{view:"checkbox",name: 1, id:1,labelRight:webix.i18n.calendar.dayFull[1]},
				{view:"checkbox",name: 2,id:2,labelRight:webix.i18n.calendar.dayFull[2]},
				{view:"checkbox",name: 3,id:3,labelRight:webix.i18n.calendar.dayFull[3]},
				{view:"checkbox",name: 4,id:4,labelRight:webix.i18n.calendar.dayFull[4]},
				{view:"checkbox",name: 5,id:5,labelRight:webix.i18n.calendar.dayFull[5]},
				{view:"checkbox",name: 6,id:6,labelRight:webix.i18n.calendar.dayFull[6]},
				{view:"checkbox",name: 7,id:7,labelRight:webix.i18n.calendar.dayFull[0]}
			]
		},
		getValue:function(){
			var values = this.getValues();
			var result = [];
			for(var d in values)
				if(values[d])
					result.push(d);
			return result.join();
		},
		setValue:function(values){
			var result={};
	        for(var i=1;i < 8;i++)
				result[i] =0;
			if(typeof values!="object")
				values = values.split(",");
			for(var i=0; i< values.length;i++)
                result[parseInt(values[i],10)] = 1;
			this.setValues(result);
		}
	}, webix.MouseEvents, webix.EventSystem, webix.ui.form);
	if(!config.weekly_form)
		config.weekly_form = [
			{
				height:10
			},
			{
				type:"clean",
				css: "webix_rec_counter",
				paddingX: 8,
				cols:[
					{view:"label", borderless: true, label:labels.recurring.every,width:xy.recurring.label_every},
					{view:"counter", id:"weekCount", name:"weekCount", value:1,width:125},
					{view:"label", label:labels.recurring.week}
				]
			},
			{view:"weeklist",id:"weekDays", name:"weekDays"},
			{}
		];
	
	
	/*Monthly view*/
	var monthDays = {};
	for(var i=1;i<32;i++)
		monthDays[i]=i;
		
	if(!scheduler.templates.rec_month_d)
		scheduler.templates.rec_month_d = function(){
			return "<div class='radio'><div class='on'></div></div><div class='text'>"+labels.recurring.month_day+"</div>";
		};
	if(!scheduler.templates.rec_month_w)
		scheduler.templates.rec_month_w = function(){
			return "<div class='radio'><div class='on'></div></div><div class='text'>"+labels.recurring.week_day+"</div>";
		};
	
	if(!scheduler.templates.rec_month_d_blured)
		scheduler.templates.rec_month_d_blured = function(){
			return "<div class='radio blured'></div><div class='text'>"+labels.recurring.month_day+"</div>";
		};
	if(!scheduler.templates.rec_month_w_blured)
		scheduler.templates.rec_month_w_blured = function(){
			return "<div class='radio blured'></div><div class='text'>"+labels.recurring.week_day+"</div>";
		};
		
	if(!config.week_day_counters)
	   config.week_day_counters = [
			{id:1,value:labels.recurring.counters[0]},
			{id:2,value:labels.recurring.counters[1]},
			{id:3,value:labels.recurring.counters[2]},
			{id:4,value:labels.recurring.counters[3]},
			{id:5,value:labels.recurring.counters[4]}
		];
	if(!config.week_day_labels)
	   config.week_day_labels = [
			{id:1,value:webix.i18n.calendar.dayFull[1]},
			{id:2,value:webix.i18n.calendar.dayFull[2]},
			{id:3,value:webix.i18n.calendar.dayFull[3]},
			{id:4,value:webix.i18n.calendar.dayFull[4]},
			{id:5,value:webix.i18n.calendar.dayFull[5]},
			{id:6,value:webix.i18n.calendar.dayFull[6]},
			{id:7,value:webix.i18n.calendar.dayFull[0]}
		];
	if(!config.monthly_form)
		config.monthly_form = [

			{
				type:"clean",
				paddingX: 10,
				cols:[
					{view:"label", label:labels.recurring.every,width:xy.recurring.label_every},
					{view:"counter", id:"monthCount", name:"monthCount", value:1,width:125},
					{view:"label", label:labels.recurring.month},
					{view:"text", hidden: true, name:"monthType",value:"Day",width:1}
				]
			},

			{
				view:"accordion",
				id:"monthTypeSelect",
				//borderless: true,
				rows:[
					{
						headerAltHeight:50,
						headerHeight:50,
						id:"typeDayM",
						header:scheduler.templates.rec_month_d,
						headerAlt:scheduler.templates.rec_month_d_blured,
						body:{
							view:"datecells",
							id:"monthDayM",
							name:"monthDayM",
							data:monthDays
						}
					},
					{
						headerAltHeight:50,
						headerHeight:50,
						id:"typeWeekM",
						header:scheduler.templates.rec_month_w,
						headerAlt:scheduler.templates.rec_month_w_blured,
						collapsed: true,
						body:{
							type:"clean",
							rows:[
								{height: 10},
								{
									type:"clean",
									paddingX:10,
									cols:[
									{view:"select",value:1,id:"weekCountM",name:"weekCountM", css:"", options:config.week_day_counters},
									{view:"select",value:1,id:"weekDayM",name:"weekDayM", css:"", options:config.week_day_labels}
								]},
								{}
							]
						}
					}
				]
			}
		];
	if(!config.year_months){
		config.year_months = (scheduler.locale.date?scheduler.locale.date.month_short:webix.i18n.calendar.monthShort);
	}
	/*Yearly view*/
	if(!config.yearly_form)
		config.yearly_form = [

			{
				type:"clean",
				cols:[
					{view:"label", label:labels.recurring.every,width:xy.recurring.label_every},
					{view:"counter", id:"yearCount", name:"yearCount", value:1,width:125},
					{view:"label", label:labels.recurring.year}
				]
			},
			{
				view:"datecells",
				id:"monthDayY",
				borderless: true,
				data:config.year_months,
				x_count:4,
				height:130
			},
			{
				view:"checkbox",label:labels.recurring.week_day, id:"typeWeekY", name:"typeWeekY", labelWidth:250, value:1
			},

			{
				id:"yearWeekRow",
				type:"clean",
				cols:[
					{view:"select",value:1,id:"weekCountY",name:"weekCountY",options:config.week_day_counters},
					{view:"select",value:1,id:"weekDayY",name:"weekDayY",options:config.week_day_labels}
				]
			},
			{}
			
		];
	
	/*recurring subviews*/
	if(!config.recurring_views)
		config.recurring_views = [
			{id:"recForm", view:"form", css: "webix_rec_form", padding:0, scroll: false, elements: config.rec_init_form},
			{id:"endRepeatForm", view:"form",type: "clean", elements: config.end_repeat_form},
			{id:"daily",view:"daily",elements: config.daily_form},
			{id:"weekly", view:"weekly", type: "clean", elements: config.weekly_form},
			{id:"monthly", view:"monthly", elements: config.monthly_form, margin:10},
			{id:"yearly", view:"yearly", padding: 10, margin:10, type: "clean", elements: config.yearly_form}
		];
	
	/*adds recurring view into cells collection of scheduler's multiview*/
	config.views.push({
		view:"recurring",
		id:"recurring"
	});
	
	/*recurring view definition*/
	webix.protoUI({
		name:"recurring",
		defaults:{
			padding:0,
			rows:[
				{view:"toolbar",id:"reccuringBar", css:"webix_subbar", elements:config.recurring_bar, visibleBatch:"default"},
				{id:"recViews", animate: false, cells:config.recurring_views}
			],
			typeToId:{"day":"daily","week":"weekly","month":"monthly","year":"yearly"},
			endlessDate: config.endless_date
		},
		$init: function() {
	  		this.name = "Recurring";
			this.$view.className += " webix_recurring";
			this.$ready.push(this._setEvents);
		},
		_setEvents:function(){
			var idToType = {};
			for(var type in this._settings.typeToId)
				idToType[this._settings.typeToId[type]] = type;
			this.define("idToType",idToType);
			webix.delay(function(){
				var topParent = this.getTopParentView();
				topParent.$$("rec_type").attachEvent("onItemClick",this._showRecViewsList);
				topParent.$$("reccuringBar").attachEvent("onItemClick",webix.bind(function(id){
					id = this.innerId(id);
					switch(id){
						case "recDone2":
						case "recEndCancel":
						 	this.$$("recViews").back();
							this.$$("reccuringBar").showBatch("default");
						 	break;
						case "recCancel":
						 	this.$$("views").back();
						 	break;
						case "recDone":
							this.$$("recurring")._applyRecurrence();
						 	this.$$("views").back();
						 	break;
						case "recEndDone":
							var endDate;
							if(this.$$("endBy").getValue()=="1")
								endDate = this.$$("endByDate").getValue();
							else
								endDate = this.$$("recurring")._settings.endlessDate;
							this.$$("endRepeat").setValue(endDate);
						 	this.$$("recViews").back();
							this.$$("reccuringBar").showBatch("default");
						 	break;
					}
				},topParent));
				topParent.$$("recList").attachEvent("onItemClick",webix.bind(this._showRecView,topParent));
				topParent.$$("endRepeat").attachEvent("onItemClick",webix.bind(function(id){
					this._showRecView.call(topParent,"endRepeatForm");
					topParent.$$("reccuringBar").showBatch("endRepeat");
					this._setEndDate();
				},this));
				
				if(topParent.$$("typeWeekY"))
					topParent.$$("typeWeekY").attachEvent("onItemClick",function(){
						if(this.getValue())
							topParent.$$("yearWeekRow").show();
						else
							topParent.$$("yearWeekRow").hide();
					});
				if(topParent.$$("endBy"))
					topParent.$$("endBy").attachEvent("onItemClick",function(){
						if(this.getValue() == "1")
							topParent.$$("endByDate").show();
						else
							topParent.$$("endByDate").hide();
					});
				topParent.$$("editForm").attachEvent("onItemClick", webix.bind(function(id){
					id = this.innerId(id);
					if(id=="end_date"){
						this._showDateForm(id);
					}
				},topParent));			
				topParent.$$("weekly").elements.weekDays = topParent.$$('weekDays');
				topParent.$$("monthly").elements.monthDayM = topParent.$$('monthDayM');
				topParent.$$("yearly").elements.monthDayY = topParent.$$('monthDayY');
				topParent.$$("editForm").elements.endRepeat = topParent.$$('endRepeat');

				// hide rec_type field in case of editing series occurrence
				topParent.$$("views").attachEvent("onViewChange",function(v1,v2){
					if(topParent._recTypeState && topParent.$$("form").config.id == v2){
						if(topParent._recTypeState == "hide"){
							topParent.$$("rec_type").hide();
							topParent._recTypeState = "show";
						}
						else if(topParent._recTypeState == "show")
							topParent.$$("rec_type").show();
					}
				});
				//topParent.$$("editForm").elements.end_date_rec = topParent.$$('end_date');
			},this);
		},
		_showRecViewsList:function(){
			var topParent = this.getTopParentView(); 
			topParent.$$("recurring").show();
			if(topParent.$$("recForm")){
				topParent.$$("recForm").show();
				topParent.$$("recurring").setValue();
				topParent.$$("endRepeat").setValue(topParent.$$("endRepeat").config.value);
			}
		},
		_showRecView:function(id){

			if(this.$$(id)){
				//webix.delay(function(){
					this.$$(id).show();
					
				//},this);
				this.$$("reccuringBar").showBatch("other");
			}

			if(!this.$$("endRepeat").getValue())
				this.$$("endRepeat").setValue(this.$$("recurring")._settings.endlessDate);
		},
		setValue:function(data){
			var topParent = this.getTopParentView();
			data = (data||topParent.getItem(topParent.getCursor()));
			var recType = (topParent.$$("rec_type").getValue()||"_____").split("_");
			var config = topParent.$$("recurring")._settings;
			topParent.$$("recList").setValue(recType[0]&&recType[0]!==""?config.typeToId[recType[0]]:"none");
			var typeArr;
			var startDate = topParent.$$("start_date").getValue();
			var values = {};
			for(var type in config.typeToId){
				if(type==recType[0]){
					recType.push(startDate);
					typeArr = webix.copy(recType);
				}else{
					typeArr = [type,1,"","","",startDate];
				}
				topParent.$$(config.typeToId[type]).setValue(typeArr);
			}
		},
		getValue:function(){
			var topParent = this.getTopParentView();
			var type = topParent.$$("recList").getSelectedId();
			return (type=="none"?["","","","","",""]:topParent.$$(type).getValue());
		},
		_applyRecurrence:function(){
			var topParent = this.getTopParentView();
			var value = this.getValue();
			var startDate = topParent.$$("start_date").getValue();
			var endDate = topParent.$$("end_date").getValue();
			var length = endDate.valueOf()-startDate.valueOf();
			topParent.$$("event_length").setValue(length/1000);

			if(!value[0]){
				topParent.$$("endRepeat").setValue(topParent.$$("end_date").getValue());
				topParent.$$("rec_type").setValue("");
				topParent.$$("event_length").setValue("");
				return;
			}
			else if(value[0]=="week"){
				startDate = webix.Date.add(startDate,(-1)*(startDate.getDay()+6)%7,"day",true);
			}
			else if(value[0]=="month"){
				if(value[5])
					startDate.setDate(value[5]);
				/*else
					startDate.setDate(1);*/
			}
			else if(value[0]=="year"&&value[5]){
				startDate.setMonth(value[5]);
				//startDate.setDate(1);
			}
			topParent.$$("start_date").setValue(startDate);
		    topParent.$$("end_date").setValue(new Date(startDate.valueOf()+length));
			value.pop();
		 	var repeat = "";
			if(topParent.$$("endBy").getValue()=="0")
 				repeat = "no";
			topParent.$$("rec_type").setValue(value.join("_")+"#"+repeat);
		},
		_setEndDate:function(){
			var topParent = this.getTopParentView();
			var values = topParent.$$("editForm").getValues();
			var end =  values["end_date"];
			if(end.valueOf() == this._settings.endlessDate.valueOf()){
				topParent.$$("endBy").setValue("0");
				topParent.$$("endByDate").setValue(scheduler.config.end_by||webix.Date.add(topParent.$$("end_date").getValue(),1,"year",true),true);
			}
			else{
				topParent.$$("endBy").setValue("1");
				topParent.$$("endByDate").define("minDate",end);
				topParent.$$("endByDate").setValue(end);
			}
			this._setEndByVisibility();
		},
		_setEndByVisibility:function(){
			var topParent = this.getTopParentView();
			var value = topParent.$$("endBy").getValue();
		    if(value == "1")
				topParent.$$("endByDate").show();
			else
				topParent.$$("endByDate").hide();
		}
	}, webix.DataLoader, webix.ui.form, webix.EventSystem, webix.Settings);
});

})();