// Retruns the bottom bound of the example containers, to be used for the
// scrollSpy and for navigating to examples
function getContainerHeights (exampleContainers) {
	var old = 0;
	var headerHeight = 72;
	return [headerHeight].concat(_.map(exampleContainers, function (container) {
		var currentContainer = old + $(container).height() + 15;
		old = currentContainer;
		return currentContainer;
	}));
}

$(document).ready(function() {
	//// Navigation

	// Increase document length based on window height. This is to ensure that
	// when you scroll to the last example it will be at the top of the page
	$('.example-wrapper').css({
		marginBottom: $(window).height() - 415
	});

	var $containerDivs = $('.example-container');

	$(window).scroll(function () {
    var currentNav;
		var fromTop = $(document).scrollTop();
		var containerHeights = getContainerHeights($containerDivs);
		for (var i = 0; i < containerHeights.length; i++) {
			if (containerHeights[i] > fromTop) {
        currentNav = i - 1;
				break;
			}
		}
    navView.setSelectedItem('c' + currentNav);
	});


	var ExampleView = Backbone.View.extend({

		template : _.template($('#example-template').html()),

		render : function() {
			var emp = this.model.toJSON();
			var html = this.template(emp);
			this.$el.append(html);
		}
	});

	var Example = Backbone.Model.extend({});
	var Examples = Backbone.Collection.extend({ model : Example });
	var navView = new Backbone.CollectionView({
		el : $('#example-navigation'),
		selectable : true,
		collection : new Examples([
			{example: 'Single Selection'},
			{example: 'Multiple Selection'},
			{example: 'Using arrow keys'},
			{example: 'Sorting'},
			{example: 'Adding and Removing'},
			{example: 'Selected Event'},
			{example: 'Filtering by selectable'},
			{example: 'Filtering by sortable'}
		]),
		modelView : ExampleView
	});

	navView.render();

	// Navigate to newly selected example, this should be triggered by clicking
	// and arrow keys but not by selection change caused by scrolling
	navView.on('selectionChanged',function(newSelectedItems) {
		var containerHeights = getContainerHeights($containerDivs);

		// cut the 'c' off the 'cid'
		var containerNum = newSelectedItems[0].substring(1);
		
		// scroll to selected example
		window.scrollTo(0, containerHeights[containerNum]);
	});

	//// Examples

	var Employee = Backbone.Model.extend({});
	var Employees = Backbone.Collection.extend({ model : Employee});

	function createACollection() {
		return new Employees([
			new Employee({firstName : 'Sherlock', lastName : 'Holmes'}),
			new Employee({firstName : 'John', lastName : 'Watson'}),
			new Employee({firstName : 'Mycroft', lastName : 'Holmes'})
		]);
	}

	var EmployeeView = Backbone.View.extend({

		template : _.template($('#employee-template').html()),

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

		var curSelectedModel = addRemoveItemView.getSelectedItem( { by : 'model' } );

		if(curSelectedModel) {
			addRemoveItemView.collection.remove(curSelectedModel);
		}
	});

	$('#demoAddToCollectionButton').click(function() {

		addRemoveItemView.collection.add({firstName : 'Super', lastName : 'Sleuth'});

	});

	var selectedEventView = new Backbone.CollectionView({
		el : $('#demoSelectedEvent'),
		selectable : true,
		collection : createACollection(),
		modelView : EmployeeView
	});

	selectedEventView.on('selectionChanged', function(newSelectedItems) {

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
