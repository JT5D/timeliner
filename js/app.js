jQuery(function($) {
  window.Timeliner = new Timeliner({
    el: $('.recline-app')
  })
});

var Timeliner = Backbone.View.extend({
  events: {
    'submit form.js-load-url': '_onLoadURL'
  },

  initialize: function() {
    this.el = $(this.el);
    this.dataExplorer = null;
    this.explorerDiv = $('.data-explorer-here');
    _.bindAll(this, 'viewExplorer', 'viewHome');

    this.router = new Backbone.Router();
    this.router.route('', 'home', this.viewHome);
    this.router.route(/explorer/, 'explorer', this.viewExplorer);
    Backbone.history.start();

    var state = recline.View.parseQueryString(decodeURIComponent(window.location.search));
    if (state) {
      _.each(state, function(value, key) {
        try {
          value = JSON.parse(value);
        } catch(e) {}
        state[key] = value;
      });
    }
    var dataset = null;
    if (state.dataset || state.url) {
      dataset = recline.Model.Dataset.restore(state);
    }
    if (dataset) {
      this.createExplorer(dataset);
    }
  },

  viewHome: function() {
    this.switchView('home');
  },

  viewExplorer: function() {
    this.router.navigate('explorer');
    this.switchView('explorer');
  },

  switchView: function(path) {
    $('.backbone-page').hide(); 
    var cssClass = path.replace('/', '-');
    $('.page-' + cssClass).show();
  },

  // make Explorer creation / initialization in a function so we can call it
  // again and again
  createExplorer: function(dataset) {
    var self = this;
    // remove existing data explorer view
    var reload = false;
    if (this.dataExplorer) {
      this.dataExplorer.remove();
      reload = true;
    }
    this.dataExplorer = null;
    var $el = $('<div />');
    $el.appendTo(this.explorerDiv);
    this.dataExplorer = new recline.View.Timeline({
      model: dataset,
      el: $el
    });
    // show the view
    this.viewExplorer();
    // load the data
    dataset.query();
  },

  _onLoadURL: function(e) {
    e.preventDefault();
    var $form = $(e.target);
    var source = $form.find('input[name="source"]').val();
    var datasetInfo = {
      id: 'my-dataset',
      url: source
    };
    var dataset = new recline.Model.Dataset(datasetInfo, 'gdocs');
    this.createExplorer(dataset);
  }
});

