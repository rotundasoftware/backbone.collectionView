// Retruns the bottom bound of the example containers, to be used for the
// scrollSpy and for navigating to examples
function getContainerHeights (exampleContainers) {
	var marginHeight = 15;
	var lastHeight = 0;

	return _.map(exampleContainers, function (container) {
		var currentContainer = lastHeight + $(container).height() + marginHeight;
		lastHeight = currentContainer;
		return currentContainer;
	});
}

$(document).ready(function() {

	// Store all example container divs so we can get their heights
	var $containerDivs = $('.example-container');

	// When the user scrolls, update the nav to show the current example
	$(window).scroll(function () {

		var fromTop = $(document).scrollTop();
		var containerHeights = getContainerHeights($containerDivs);

		for (var i = 0; i < containerHeights.length; i++) {
			if (containerHeights[i] > fromTop) {
				navView.setSelectedItem('c' + i);
				break;
			}
		}
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
			new Example({example : 'Single Selection'}),
			new Example({example : 'Multiple Selection'}),
			new Example({example : 'Using arrow keys'}),
			new Example({example : 'Sorting'}),
			new Example({example : 'Adding and Removing'}),
			new Example({example : 'Selected Event'}),
			new Example({example : 'Filtering by selectable'}),
			new Example({example : 'Filtering by sortable'})
		]),
		modelView : ExampleView
	});

	navView.render();

	// Navigate to newly selected example, this should be triggered by clicking
	// and arrow keys but not by selection change caused by scrolling
	navView.on('selectionChanged', function(newSelectedItems, oldSelectedItems) {

		// Get scroll destination heights for each example
		var containerHeights = getContainerHeights($containerDivs);

		var scrollTarget;
		if (newSelectedItems.length) {
			scrollTarget = newSelectedItems[0];
		} else {
			scrollTarget = oldSelectedItems[0];
		}

		// cut the 'c' off the 'cid'
		var containerNum = scrollTarget.substring(1);
		
		// scroll to selected example
		window.scrollTo(0, containerHeights[containerNum - 1]);
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

	// Increase document length based on window height. This is to ensure that
	// when you scroll to the last example, it will be at the top of the page
	var headerHeight = 78;
	var lastDiv = $(_.last($containerDivs)).height() + headerHeight;

	$('.example-wrapper').css({
		marginBottom: $(window).height() - lastDiv
	});
});
