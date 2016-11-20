$.ajaxSetup({ xhrFields: { withCredentials: true } });

if ($.cookie("nb.gallery.url") == null) {
  var base = "";
} else {
  var base = $.cookie("nb.gallery.url");
}

require([base + '/Jupyter/static/integration/bootbox.min.js', 'services/kernels/kernel'], function(bootbox, kernel) {
  MyPKI = {
    init: function(options) {
      var stashed_kernel;
      
      if (!options) {
        options = {};
      }
      
      if (Jupyter.keyboard_manager == undefined) {
        Jupyter.keyboard_manager = { 
          command_shortcuts: { 
            _shortcuts: {}, 
            clear_shortcuts: function(){} 
          } 
        };
      }
      
      if (Jupyter.notebook == undefined) {
        Jupyter.notebook = {
          clear_output: function() {}
        };
      }
      
      if (Jupyter.notebook.kernel) {
        stashed_kernel = Jupyter.notebook.kernel;
      } 
      
      Jupyter.notebook.kernel = new kernel.Kernel("/Jupyter/api/kernels","wss://"+window.location.host,"ruby");
      
      Jupyter.notebook.kernel.events.on('kernel_connected.Kernel', function() {
        var flags = JSON.stringify(options);
        var command = "require 'mypki'; MyPKI.init **Hash[Oj.load('" + flags + "').map{|k,v| [k.to_sym, v]}]";

        Jupyter.notebook.kernel.execute(command, {
          iopub: {
            output: function(output) { 
              if (output.msg_type == 'display_data') {
                if (output.content.data != undefined) {
                  $.globalEval(output.content.data['application/javascript']);
                }
              } else if (output.msg_type == 'execute_result') {
                Jupyter.notebook.kernel.kill();
                Jupyter.notebook.kernel = stashed_kernel;
                
                if (output.content.data['text/plain'] == 'true') {
                  if (Jupyter.notification_area) {
                    Jupyter.notification_area.get_widget("kernel").hide();
                  } else {
                    bootbox.dialog({
                      title: 'Success',
                      message: 'Your PKI has been successfully configured!'
                    });
                  }
                } else {
                  bootbox.dialog({
                    title: 'Error',
                    message: 'An error occurred configuring PKI. Please try again.'
                  });
                }
              } else if (output.content.evalue != undefined) {
                Jupyter.notebook.kernel.kill();
                Jupyter.notebook.kernel = stashed_kernel;
                
                bootbox.dialog({
                  title: 'Error',
                  message: 'An error occurred configuring PKI. Please try again.'
                });
              }
            },
          },
        }, { 
          silent: false,
          store_history: true,
          stop_on_error: true
        });
      });
      
      Jupyter.notebook.kernel.start();
    }
  };
  
  console.log("gallery-common loaded");
});
