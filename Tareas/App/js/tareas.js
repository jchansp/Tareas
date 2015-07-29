// Initialize your app
var myApp = new Framework7({
    modalTitle: "Tareas"
});

// Export selectors engine
var $$ = Dom7;

// Add views
var mainView = myApp.addView(".view-main", {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});

Parse.initialize("eRgDTObAZxFM7pb2MPjCYnafz6lv1bMQK1Qephs3", "sGcjuRJvDuWAzBxBjnzcxIQbrfjITIqtxRD9c6B5");
var Tarea = Parse.Object.extend("Tarea");
var tareas = localStorage.tareas ? JSON.parse(localStorage.tareas) : [];

$$(".popup").on("open", function() {
    $$("body").addClass("with-popup");
});
$$(".popup").on("opened", function() {
    $$(this).find("input[name=\"title\"]").focus();
});
$$(".popup").on("close", function() {
    $$("body").removeClass("with-popup");
    $$(this).find("input[name=\"title\"]").blur().val("");
});

// Popup colors
$$(".popup .color").on("click", function() {
    $$(".popup .color.selected").removeClass("selected");
    $$(this).addClass("selected");
});

// Add Task
$$(".popup .add-task").on("click", function() {
    var title = $$(".popup input[name=\"title\"]").val().trim();
    if (title.length === 0) {
        return;
    }
    var color = $$(".popup .color.selected").attr("data-color");
    var tarea = new Tarea();
    tarea.save({
        title: title,
        color: color,
        checked: ""
    }, {
        success: function(tarea) {
            console.log(tarea);
            tareas.push(tarea);
            localStorage.tareas = JSON.stringify(tareas);
            initialize();
            myApp.closeModal(".popup");
        },
        error: function(tarea, error) {
            console.log(tarea, error);
        }
    });
});

// Build HTML using Template7 template engine
var tareaTemplateSource = $$("#tarea-template").html();
var tareaTemplate = Template7.compile(tareaTemplateSource);

function initialize() {
    var renderedList = tareaTemplate(tareas);
    $$(".todo-items-list").html(renderedList);
}

// Build HTML on App load
initialize();

// Mark checked
$$(".todo-items-list").on("change", "input", function() {
    var input = $$(this);
    var item = input.parents("li");
    var checked = input[0].checked;
    var objectId = item.attr("data-objectId"); // * 1;
    for (var i = 0; i < tareas.length; i++) {
        if (tareas[i].objectId === objectId) {
            tareas[i].checked = checked ? "checked" : "";
            var query = new Parse.Query(Tarea);
            query.get(objectId, {
                success: function(tarea) {
                    tarea.checked = checked ? "checked" : "";
                    tarea.save({
                        checked: checked ? "checked" : ""
                    }, {
                        success: function(tarea) {
                            console.log(tarea);
                        },
                        error: function(tarea, error) {
                            console.log(tarea, error);
                        }
                    });
                },
                error: function(tarea, error) {
                    console.log(tarea, error);
                }
            });

        }
    }
    localStorage.tareas = JSON.stringify(tareas);
});

// Delete item
$$(".todo-items-list").on("delete", ".swipeout", function() {
    var objectId = $$(this).attr("data-objectId"); // * 1;
    var index;
    for (var i = 0; i < tareas.length; i++) {
        if (tareas[i].objectId === objectId) index = i;
    }
    if (typeof(index) !== "undefined") {
        tareas.splice(index, 1);
        localStorage.tareas = JSON.stringify(tareas);
    }
    var query = new Parse.Query(Tarea);
    query.get(objectId, {
        success: function(tarea) {
            tarea.destroy({
                success: function(tarea) {
                    console.log(tarea);
                },
                error: function(tarea, error) {
                    console.log(tarea, error);
                }
            });
        },
        error: function(tarea, error) {
            console.log(tarea, error);
        }
    });
});

// Update app when manifest updated 
// http://www.html5rocks.com/en/tutorials/appcache/beginner/
// Check if a new cache is available on page load.
window.addEventListener("load", function(e) {
    window.applicationCache.addEventListener("updateready", function(e) {
        if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
            // Browser downloaded a new app cache.
            myApp.confirm("A new version of Tareas is available. Do you want to load it right now?", function() {
                window.location.reload();
            });
        } else {
            // Manifest didn't changed. Nothing new to server.
        }
    }, false);
    window.setInterval(function() {
        var query = new Parse.Query(Tarea);
        query.find({
            success: function(results) {
                console.log(results);
                localStorage.tareas = JSON.stringify(results);
                tareas = JSON.parse(localStorage.tareas);
                initialize();
            },
            error: function(error) {
                console.log(error);
            }
        });
    }, 10000);
}, false);