var movies;
var currentPage;
var nbMoviesTotal;
var pageLimit = 10;
var api_url;
var stringResearch;

$(document).ready(function()
{
    runAppli(false);
});

function runAppli(isSearch)    {
    movies = [];
    currentPage = 1;
    nbMoviesTotal = -1;
    $("#movies").html("");
    $("#movies").listview("refresh");
    stringResearch = $("#nomFilm")[0].value;
    if(isSearch && stringResearch != "")    {
        api_url = 'http://api.rottentomatoes.com/api/public/v1.0/movies.json';
        appelAPI();
    }
    else {
        stringResearch = "";
        api_url = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json';
        appelAPI();
    }
}

function appelAPI() {

    $.ajax({
        beforeSend: function() { $.mobile.loading("show"); }, //Show spinner
        complete: function() { $.mobile.loading("hide") }, //Hide spinner
        type:"GET",
        url: api_url, //La route
        data :  {
            apikey : '7waqfqbprs7pajbz28mqf6vz',
            page_limit : pageLimit,
            page : currentPage,
            q : stringResearch,
        },
        dataType:"jsonp", //Le type de donnée de retour
        success: function(data){ //La fonction qui est appelée si la requête a fonctionné.
            if(nbMoviesTotal == -1)
                nbMoviesTotal = data.total;
            genererPage(data);
        },
        error: function(){ //La fonction qui est appelée si une erreur est survenue.
            $("#error").popup("open");
        },
    });       
}

function genererPage(data) {
    for(var i=0; i<data.movies.length && movies.length < nbMoviesTotal; i++)  {
        data.movies[i].picture="";
        movies.push(data.movies[i]);
        idMovie = movies.length-1;
        mTitle = movies[idMovie].title;
        mPoster = movies[idMovie].posters.original;
        mAnnee = movies[idMovie].year;
        $("#movies").append("<li><a class='movie' href='#page2' data-idmovie='"+idMovie+"'><img src='"+mPoster+"'><h2>"+mTitle+"</h2><p>"+mAnnee+"</p></a></li>")
    }
    $("#movies").listview("refresh");
}


$(document).scroll(function() {
    if(movies.length != 0 && $.mobile.activePage.attr('id') == "page1")
        if($(document).scrollTop() + $(window).height() == $(document).height()) {
            if(movies.length < nbMoviesTotal)   {
                currentPage++;
                appelAPI();
            }
        }
});

$(document).on('click', '.movie', function(){
    var idMovie = $(this).data("idmovie");
    mTitle = movies[idMovie].title;
    mPoster = movies[idMovie].posters.original;
    mAnnee = movies[idMovie].year;
    mResume = movies[idMovie].synopsis;
    mPicture = movies[idMovie].picture;
    $("#identity").text(idMovie);
    $("#title").text(mTitle);
    $("#image").attr("src",mPoster);
    $("#picture").attr("src",mPicture);
    if(mResume != "")
        $("#synopsis").html("<span class='subtitle'>Synopsis</span> "+mResume);
});


$(document).on("panelbeforeopen", "#recherche", function( event, ui ) {
    runAppli(true);
} );

$(document).on('click', '#closePanel', function(){
    runAppli(false);
    $("#recherche").panel("close");
    $("#nomFilm").text("0");
    document.location.href = "#page1";
});

$(document).on("change","#nomFilm",function(event, ui)  {
    runAppli(true);
});

$(document).on('click', '.change-pic-btn', function(event) {
  event.preventDefault();
  if (!navigator.camera) {
      alert("Camera API not supported", "Error");
      return;
  }
  var options =   {   quality: 50,
                      destinationType: Camera.DestinationType.DATA_URL,
                      sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Album
                      encodingType: 0     // 0=JPG 1=PNG
                  };

  navigator.camera.getPicture(
      function(imgData) {

            idMovie = $("#identity").text();
            mPicture = "data:image/jpeg;base64,"+imgData;
            movies[idMovie].picture = mPicture
            $("#picture").attr("src",mPicture);
      },
      function() {
          alert('Error taking picture', 'Error');
      },
      options);

  return false;
});