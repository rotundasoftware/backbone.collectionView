  
$(document).ready(function() {

	var Employee = Backbone.Model.extend({});
  var Employees = Backbone.Collection.extend({ model : Employee});

  function createACollection() {
	  var emp1 = new Employee({firstName : 'Sherlock', lastName : 'Holmes'});
	  var emp2 = new Employee({firstName : 'John', lastName : 'Watson'});
	  var emp3 = new Employee({firstName : 'Mycroft', lastName : 'Holmes'});
		return new Employees([emp1,emp2,emp3]);
	}

  var EmployeeView = Backbone.View.extend({

		template : _.template($("#employee-template").html()),

		render : function() {
			var emp = this.model.toJSON();
			var html = this.template(emp);
			this.$el.append(html);
		}
	});

	var singleSelectionView = new Backbone.CollectionView({
		el : $('#demoSingleSelectionList'),
		selectable : true,
		collection : createACollection(),
		modelView : EmployeeView
	});

	singleSelectionView.render();

	var multipleSelectionView = new Backbone.CollectionView({
		el : $('#demoMultipleSelectionList'),
		selectable : true,
		selectMultiple : true,
		collection : createACollection(),
		modelView : EmployeeView
	});

	multipleSelectionView.render();

	var arrowSelectionView = new Backbone.CollectionView({
		el : $('#demoUpDownArrowSelection'),
		selectable : true,
		collection : createACollection(),
		modelView : EmployeeView
	});

	arrowSelectionView.render();

	var sortableView = new Backbone.CollectionView({
		el : $('#demoSortable'),
		selectable : true,
		sortable : true,
		collection : createACollection(),
		modelView : EmployeeView
	});

	sortableView.render();

	$('#showModelSorting').click(function() {

		var firstNames = sortableView.collection.pluck('firstName');
		var lastNames = sortableView.collection.pluck('lastName');
		alert(JSON.stringify(_.zip(firstNames, lastNames)));

	});

	var addRemoveItemView = new Backbone.CollectionView({
		el : $('#demoAddAndRemoveFromList'),
		selectable : true,
		collection : createACollection(),
		modelView : EmployeeView
	});

	addRemoveItemView.render();

	$('#demoRemoveFromCollectionButton').click(function() {

		var curSelectedModel = addRemoveItemView.getSelectedItem( { by : "model" } );

		if(curSelectedModel) {
			addRemoveItemView.collection.remove(curSelectedModel);
		}
	});

	$('#demoAddToCollectionButton').click(function() {

		addRemoveItemView.collection.add({firstName : 'Super',lastName : 'Sleuth'});

	});

	var selectedEventView = new Backbone.CollectionView({
		el : $('#demoSelectedEvent'),
		selectable : true,
		collection : createACollection(),
		modelView : EmployeeView
	});

	selectedEventView.on("selectionChanged",function(newSelectedItems,oldSelectedItems) {

		if(newSelectedItems.length === 1) {
			var newSelectedModel = this.viewManager.findByModel( this.collection.get( newSelectedItems[0] ) ).model;
			alert('The newly selected model: ' + newSelectedModel.get('firstName') + ' ' + newSelectedModel.get('lastName'));
		}
		else {
			alert('All items were unselected.');
		}

	});

	selectedEventView.render();

	var selectableFilterView = new Backbone.CollectionView({
		el : $('#demoSelectableFilter'),
		selectable : true,
		collection : createACollection(),
		modelView : EmployeeView,
		selectableModelsFilter : function(model) {
			return model.get('lastName') === 'Holmes';
		}
	});

	selectableFilterView.render();

	var sortableFilterView = new Backbone.CollectionView({
		el : $('#demoSortableFilter'),
		selectable : true,
		sortable : true,
		collection : createACollection(),
		modelView : EmployeeView,
		sortableModelsFilter : function(model) {
			return model.get('lastName') === 'Holmes';
		}
	});

	sortableFilterView.render();


/*
	viewCollection = new Backbone.CollectionView({
		el : $('#listForCollection'),
		selectable : true,
		selectMultiple : true,
		collection : createACollection(),
		modelView : EmployeeView,
		sortable : true,
		sortableModelsFilter : function(model) {
			return model.get("firstName") === 'Oleg';
		}
	});

	viewCollection.render();

  var EmployeeViewForTableList = Backbone.View.extend({

		tagName : 'tr',

		template : _.template($("#employee-template-for-table-list").html()),

		initialize : function() {
			console.log('employee view initialized');
		},

		render : function() {
			var emp = this.model.toJSON();
			var html = this.template(emp);
			this.$el.append(html);
		}
	});


	viewCollectionForTableList = new Backbone.CollectionView({
		el : $('#tableForCollection'),
		selectable : true,
		selectMultiple : true,
		collection : createACollection(),
		modelView : EmployeeViewForTableList,
		sortable : true,
		sortableModelsFilter : function(model) {
			return model.get("firstName") === 'Oleg';
		}
	});

	viewCollectionForTableList.render();
*/
    //viewCollection.on("selectionChanged", function(newSelectedItems,oldSelectedItems) {
	//	console.log('selection listener triggered');
	//});

});

