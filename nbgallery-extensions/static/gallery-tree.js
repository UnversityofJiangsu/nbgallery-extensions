var url = window.location.origin + "/Jupyter";
$.ajaxSetup({ xhrFields: { withCredentials: true } });

if ($.cookie("nb.gallery.url") == null) {
  var base = "";
} else {
  var base = $.cookie("nb.gallery.url");
}
  
if ($.cookie("nb.client.url") != url) {
  $.ajax({
    method: 'POST',
    headers:{
      Accept: 'application/json'
    },
    url: base + '/environments', 
    data: { name: 'nbGalleryClient', url: url },
    success: function () { $.cookie("nb.client.url", url, {expires: 7}); },
    xhrFields: { withCredentials: true }
  });
}

require([base + '/Jupyter/static/integration/bootbox.min.js'], function(bootbox) {
  var button = '<div class="btn-group"><button id="pki" title="Configure PKI" class="btn btn-default btn-xs">Configure MyPKI</button></div>';
  $("#notebook_toolbar > div.col-sm-4.no-padding.tree-buttons > div").prepend(button);
  
  var configure = function() {
    MyPKI.init({
      ssh: true,
      reconfigure: true
    });
  };
  
  $('#pki').click(function() {
    $.ajax({
      method: 'GET', 
      url: '/Jupyter/api/contents/.mypki', 
      success: function() { 
        bootbox.hideAll();
        bootbox.dialog({
          title: 'Configure MyPKI',
          message: "Continuing will delete an already configured PKI. What would you like to do?",
          buttons: {
            cancel: {
              label: 'Cancel'
            },
            overwrite: {
              label: "Delete and continue",
              className: 'btn-danger',
              callback: configure
            }
          }
        });
      },
      error: configure
    });
  });
  
  console.log("gallery-tree loaded");
});
