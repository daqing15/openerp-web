/*---------------------------------------------------------
 * OpenERP base_graph
 *---------------------------------------------------------*/

openerp.base_graph = function (openerp) {
var COLOR_PALETTE = [
    '#cc99ff', '#ccccff', '#48D1CC', '#CFD784', '#8B7B8B', '#75507b',
    '#b0008c', '#ff0000', '#ff8e00', '#9000ff', '#0078ff', '#00ff00',
    '#e6ff00', '#ffff00', '#905000', '#9b0000', '#840067', '#9abe00',
    '#ffc900', '#510090', '#0000c9', '#009b00', '#75507b', '#3465a4',
    '#73d216', '#c17d11', '#edd400', '#fcaf3e', '#ef2929', '#ff00c9',
    '#ad7fa8', '#729fcf', '#8ae234', '#e9b96e', '#fce94f', '#f57900',
    '#cc0000', '#d400a8'];

QWeb.add_template('/base_graph/static/src/xml/base_graph.xml');
openerp.base.views.add('graph', 'openerp.base_graph.GraphView');
openerp.base_graph.GraphView = openerp.base.Controller.extend({

    init: function(view_manager, session, element_id, dataset, view_id) {
        this._super(session, element_id);
        this.view_manager = view_manager;
        this.dataset = dataset;
        this.model = this.dataset.model;
        this.view_id = view_id;
    },
    do_show: function () {
        // TODO: re-trigger search
        this.$element.show();
    },
    do_hide: function () {
        this.$element.hide();
    },
    start: function() {
        this.rpc("/base_graph/graphview/load", {"model": this.model, "view_id": this.view_id}, this.on_loaded);
    },
    on_loaded: function(data) {
        this.all_fields = data.all_fields;
        this.fields_view = data.fields_view;
        this.name = this.fields_view.name || this.fields_view.arch.attrs.string;
        this.view_id = this.fields_view.view_id;
        this.chart = this.fields_view.arch.attrs.type || 'pie';
        this.fields = this.fields_view.fields;
        this.chart_info_fields = [];
        this.operator_field = '';
        this.operator_field_one = '';
        this.operator = [];
        this.group_field = '';
        this.orientation = this.fields_view.arch.attrs.orientation || '';

        _.each(this.fields_view.arch.children, function (field) {
            if (field.attrs.operator) {
                this.operator.push(field.attrs.name);
            }
            else if (field.attrs.group) {
                this.group_field = field.attrs.name;
            }
            else {
                this.chart_info_fields.push(field.attrs.name);
            }
        }, this);

        this.operator_field = this.operator[0];
        if(this.operator.length > 1){
            this.operator_field_one = this.operator[1];
        }
        if(this.operator == ''){
            this.operator_field = this.chart_info_fields[1];
        }
        this.chart_info = this.chart_info_fields[0];
        this.x_title = this.fields[this.chart_info_fields[0]]['string'];
        this.y_title = this.fields[this.operator_field]['string'];
        this.load_chart();
    },

    load_chart: function(data) {
        var self = this;
        if(data){
            this.x_title = this.all_fields[this.chart_info_fields]['string'];
            this.y_title = this.all_fields[this.operator_field]['string'];
            self.schedule_chart(data);
        }else{
            this.dataset.read_ids(
                this.dataset.ids,
                {},
                function(res) {
                    self.schedule_chart(res);
                }
            );
        }
    },

    schedule_chart: function(results) {
        this.$element.html(QWeb.render("GraphView", {"fields_view": this.fields_view, "chart": this.chart,'view_id': this.view_id}));
        if (!results.length) {
            return;
        }
        _.each(results, function (result) {
            _.each(result, function (field_value, field_name) {
                if (typeof field_value == 'object') {
                    result[field_name] = field_value[field_value.length - 1];
                }
                if (typeof field_value == 'string') {
                    var choices = this.all_fields[field_name]['selection'];
                    _.each(choices, function (choice) {
                        if (field_value == choice[0]) {
                            result[field_name] = choice;
                        }
                    });
                }
            }, this);
        }, this);

        var graph_data = {};
        _.each(results, function (result) {
            var column_key = result[this.chart_info_fields] + "_" + result[this.group_field];
            var column_descriptor = {};
            if (graph_data[column_key] == undefined) {
                column_descriptor[this.operator_field] = result[this.operator_field];
                if (this.operator.length > 1) {
                    column_descriptor[this.operator_field_one] = result[this.operator_field_one];
                }
                column_descriptor[this.chart_info_fields] = result[this.chart_info_fields];
                if (this.group_field) {
                    column_descriptor[this.group_field] = (typeof result[this.group_field] == 'object') ? result[this.group_field][1] : result[this.group_field];
                }
            } else {
                column_descriptor = graph_data[column_key];
                column_descriptor[this.operator_field] += result[this.operator_field];
                if (this.operator.length > 1) {
                    column_descriptor[this.operator_field_one] += result[this.operator_field_one];
                }
            }
            graph_data[column_key] = column_descriptor;
        }, this);

        if (this.chart == 'bar') {
            return this.schedule_bar(_.values(graph_data));
        } else if (this.chart == "pie") {
            return this.schedule_pie(_.values(graph_data));
        }
    },

    schedule_bar: function(results) {
        var self = this;
        var view_chart = '';
        var group_list = [];
        var newkey = '', newkey_one;

        if(self.group_field && (this.operator.length <= 1)){
            view_chart = self.orientation == 'horizontal'? 'stackedBarH' : 'stackedBar';
        }else{
            view_chart = self.orientation == 'horizontal'? 'barH' : 'bar';
        }

        _.each(results, function (result) {
            if (self.group_field && (this.operator.length <= 1)) {
                newkey = result[self.group_field].split(' ').join('_');
            } else {
                newkey = "val";
            }

            if (_.contains(group_list, newkey)) {
                return;
            }
            group_list.push(newkey);
            if (this.operator.length > 1) {
                newkey_one = "val1";
                group_list.push(newkey_one);
            }
        }, this);

        var abscissa_data = {};
        _.each(results, function (result) {
            var label = result[self.chart_info_fields],
              section = {};
            if (self.group_field && (self.operator.length <= 1)){
                newkey = result[self.group_field].split(' ').join('_');
            }else{
                newkey = "val";
            }
            if (abscissa_data[label] == undefined){
                section[self.chart_info_fields] = label;
                _.each(group_list, function (group) {
                    section[group] = 0.0001;
                });
            } else {
                section = abscissa_data[label];
            }
            section[newkey] = result[self.operator_field];
            if (self.operator.length > 1){
                section[newkey_one] = result[self.operator_field_one];
            }
            abscissa_data[label] = section;
        });

        //for legend color
        var grp_color = _.map(group_list, function (group_legend, index) {
            var legend = {color: COLOR_PALETTE[index]};

            if (group_legend == "val"){
                legend['text'] = self.fields[self.operator_field]['string']
            }else if(group_legend == "val1"){
                legend['text'] = self.fields[self.operator_field_one]['string']
            }else{
                legend['text'] = group_legend;
            }
            return legend;
        });

        //for axis's value and title
        var abscissa_description = {
            template: self.chart_info_fields,
            title: "<b>"+self.x_title+"</b>"
        };
        var ordinate_description = {
            lines: true,
            title: "<b>"+self.y_title+"</b>"
        };

        var x_axis, y_axis;
        if (self.orientation == 'horizontal'){
             x_axis = ordinate_description;
             y_axis = abscissa_description;
        }else{
             x_axis = abscissa_description;
             y_axis = ordinate_description;
        }

        var bar_chart = new dhtmlXChart({
            view: view_chart,
            container: self.view_id+"-barchart",
            value:"#"+group_list[0]+"#",
            gradient: "3d",
            border: false,
            width: 1024,
            radius: 0,
            color:grp_color[0]['color'],
            origin:0,
            xAxis:{
                template:function(obj){
                    if(x_axis['template']){
                        var val = obj[x_axis['template']];
                        val = (typeof val == 'object')?val[1]:(!val?'Undefined':val);
                        return val;
                    }else{
                        return obj;
                    }
                },
                title:x_axis['title'],
                lines:x_axis['lines']
            },
            yAxis:{
                template:function(obj){
                    if(y_axis['template']){
                        var vals = obj[y_axis['template']];
                        vals = (typeof vals == 'object')?vals[1]:(!vals?'Undefined':vals);
                        return vals;
                    }else{
                        return obj;
                    }
                },
                title:y_axis['title'],
                lines: y_axis['lines']
            },
            padding: {
                left: 75
            },
            legend: {
                values: grp_color,
                align:"left",
                valign:"top",
                layout: "x",
                marker:{
                    type:"round",
                    width:12
                }
            }
        });
        for (var m = 1; m<group_list.length;m++){
            bar_chart.addSeries({
                value: "#"+group_list[m]+"#",
                color: grp_color[m]['color']
            });
        }
        bar_chart.parse(_.values(abscissa_data), "json");
        bar_chart.attachEvent("onItemClick", function(id) {
            self.open_list_view(bar_chart.get(id));
        });
    },
    schedule_pie: function(result) {
        var self = this;
        var chart =  new dhtmlXChart({
            view:"pie3D",
            container:self.view_id+"-piechart",
            value:"#"+self.operator_field+"#",
            pieInnerText:function(obj) {
                var sum = chart.sum("#"+self.operator_field+"#");
                var val = obj[self.operator_field] / sum * 100 ;
                return val.toFixed(1) + "%";
            },
            gradient:"3d",
            height: 20,
            radius: 200,
            legend: {
                width: 300,
                align:"left",
                valign:"top",
                layout: "x",
                marker:{
                    type:"round",
                    width:12
                },
                template:function(obj){
                    var val = obj[self.chart_info_fields];
                    val = (typeof val == 'object')?val[1]:val;
                    return val;
                }
            }
        });
        chart.parse(result,"json");
        chart.attachEvent("onItemClick", function(id) {
            self.open_list_view(chart.get(id));
        });
    },
    open_list_view : function (id){
        var self = this;
        id = id[self.chart_info_fields];
        if (typeof id == 'object'){
            id = id[0];
        }
        if(this.view_manager.action.context){
           this.view_manager.action.context = {};
        }
        if(!this.view_manager.action.domain) {
            this.view_manager.action.domain = [[self.chart_info_fields, '=', id],['id','in',self.dataset.ids]];
        } else {
            this.view_manager.action.domain.push([self.chart_info_fields, '=', id],['id','in',self.dataset.ids]);
        }
        var action_manager = new openerp.base.ActionManager(this.view_manager.session, this.view_manager.element_id);
        action_manager.start();
        action_manager.do_action(this.view_manager.action);
    },
    do_search: function(domains, contexts, groupbys) {
        var self = this;
        this.rpc('/base/session/eval_domain_and_context', {
            domains: domains,
            contexts: contexts,
            group_by_seq: groupbys
        }, function (results) {
            // TODO: handle non-empty results.group_by with read_group
            if(results.group_by  && results.group_by != ''){
                self.chart_info_fields = results.group_by[0];
            }else{
                self.chart_info_fields = self.chart_info;
            }
            self.dataset.context = self.context = results.context;
            self.dataset.domain = self.domain = results.domain;
            self.dataset.read_slice({}, 0, self.limit,function(response){
                self.load_chart(response);
            });
        });
    }

});

// here you may tweak globals object, if any, and play with on_* or do_* callbacks on them

};

// vim:et fdc=0 fdl=0:
