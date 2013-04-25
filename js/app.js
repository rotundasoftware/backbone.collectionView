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
			new Example({example : 'Tables'}),
			new Example({example : 'Sorting'}),
			new Example({example : 'Empty list caption'}),
			new Example({example : 'Events'}),
			new Example({example : 'Filters'}),
		]),
		modelView : ExampleView
	});

	navView.render();

	// Store all example container divs so we can get their heights
	var $containerDivs = $('.example-container');

	// When the user scrolls, update the nav to show the current example
	$(window).scroll(function () {

		var fromTop = $(document).scrollTop();
		var containerHeights = getContainerHeights($containerDivs);

		for (var i = 0; i < containerHeights.length; i++) {
			if (containerHeights[i] > fromTop) {
				navView.setSelectedModel('c' + i, { by : 'cid', silent: true});
				break;
			}
		}
	});

	// Navigate to newly selected example, this should be triggered by clicking
	// and arrow keys but not by selection change caused by scrolling
	navView.on('selectionChanged', function(newSelectedModels, oldSelectedModels) {

		// Get scroll destination heights for each example
		var containerHeights = getContainerHeights($containerDivs);

		var scrollTarget;
		if (newSelectedModels.length) {
			scrollTarget = newSelectedModels[0].cid;
		} else {
			scrollTarget = oldSelectedModels[0].cid;
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

  var EmployeeViewForTableList = Backbone.View.extend({

		tagName : 'tr',

		template : _.template($('#employee-template-for-table-list').html()),

		render : function() {
			var emp = this.model.toJSON();
			var html = this.template(emp);
			this.$el.append(html);
		}
	});


	viewCollectionForTableList = new Backbone.CollectionView({
		el : $('#demoTables'),
		selectable : true,
		collection : createACollection(),
		modelView : EmployeeViewForTableList
	});

	viewCollectionForTableList.render();

	var sortableView = new Backbone.CollectionView({
		el : $('#demoSortable'),
		selectable : true,
		sortable : true,
		collection : createACollection(),
		modelView : EmployeeView
	});

	sortableView.render();

	$('#showModelSorting').click(function() {
		alert(JSON.stringify( sortableView.collection.toJSON() ));
	});

	var emptyListCaptionCollectionView = new Backbone.CollectionView({
		el : $('#demoEmptyListCaption'),
		selectable : true,
		selectMultiple : true,
		sortable: true,
		emptyListCaption : 'There are no items in this list.',
		collection : new Employees(),
		modelView : EmployeeView
	});

	emptyListCaptionCollectionView.render();

	$('#demoRemoveFromCollectionButton').click(function() {

		var curSelectedModels = emptyListCaptionCollectionView.getSelectedModels();
		emptyListCaptionCollectionView.collection.remove(curSelectedModels);
	});

	$('#demoAddToCollectionButton').click(function() {

		emptyListCaptionCollectionView.collection.add({firstName : 'Super', lastName : 'Sleuth'});

	});

	var selectedEventView = new Backbone.CollectionView({
		el : $('#demoEvents'),
		selectable : true,
		collection : createACollection(),
		modelView : EmployeeView
	});

	  selectedEventView.on( "selectionChanged", function() {
	  	  var selectedModel = selectedEventView.getSelectedModel();
	      $( "#demoEventsCaption" ).text(
	        "The newly selected model is: " +
	        selectedModel.get( "firstName" ) + " " +
	        selectedModel.get( "lastName" ) );
		} );

	selectedEventView.render();

	var selectableFilterView = new Backbone.CollectionView({
		el : $('#demoFilters'),
		selectable : true,
		collection : createACollection(),
		modelView : EmployeeView,
		selectableModelsFilter : function(model) {
			return model.get('lastName') === 'Holmes';
		}
	});

	selectableFilterView.render();

	// Increase document length based on window height. This is to ensure that
	// when you scroll to the last example, it will be at the top of the page
	var headerHeight = 78;
	var lastDiv = $(_.last($containerDivs)).height() + headerHeight;

	$('.example-wrapper').css({
		marginBottom: $(window).height() - lastDiv
	});

	$('.tab-list li').click(function (event) {
		var $target = $(event.currentTarget);
		var $targetClass = $target.attr('class');
		var $container = $target.closest('.code-container');
		if ($targetClass.indexOf('current') === -1 ) {
			$container.find('pre.' + $targetClass).addClass('visible-code');
			var $oldTab = $target.parent().find('.current');
			$oldTab.removeClass('current');
			$container.find('pre.' + $oldTab.attr('class')).removeClass('visible-code');
			$target.addClass('current');
		}
	});
	// If the user releases the click in less than 200 ms then select the code
	// text

	var held; // This is true if the mouse has been pressed for over 200 ms
	var heldTimer;
	$('pre').mousedown(function () {
		held = false;

		if (heldTimer) window.clearTimeout(heldTimer);

		// After 200 ms, the mouse has been held down to long to perform
		// selection
		heldTimer = window.setTimeout(function () {
			held = true;
		}, 200);
	});

	$('pre').mouseup(function (event) {
		// If mouse has been held down for less than 200 ms
		if (!held) {
			var codeId = $(event.currentTarget).parent().attr('id');
			var element = document.getElementById(codeId);
			// Crossbrowser selection of text within a non-input tag
			var range;
			if (document.selection) {
				range = document.body.createTextRange();
				range.moveToElementText(element);
				range.select();
			} else if (window.getSelection) {
				range = document.createRange();
				range.selectNode(element);
				window.getSelection().addRange(range);
			}
		}
	});

});
