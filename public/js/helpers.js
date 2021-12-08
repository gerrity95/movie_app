function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

$(document).ready(function () {

        $('#sidebarCollapse').on('click', function () {
            $('#sidebar').toggleClass('active');
        });
    
    });


function timeConverter(minutes) {
    var hours = Math.floor(minutes / 60);
    var additional_mins = minutes % 60;

    return {"hours": hours, "minutes": additional_mins}
}