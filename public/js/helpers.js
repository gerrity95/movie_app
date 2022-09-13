function getQueryVariable(variable) {
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  for (let i=0; i<vars.length; i++) {
    const pair = vars[i].split('=');
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return (false);
}

$(document).ready(function() {
  $('#sidebarCollapse').on('click', function() {
    $('#sidebar').toggleClass('active');
  });
});


function timeConverter(minutes) {
  const hours = Math.floor(minutes / 60);
  const additional_mins = minutes % 60;

  return {'hours': hours, 'minutes': additional_mins};
}

function update_providers(stream_parent, rent_parent, buy_parent, wp_results, country_code, country) {
  console.log(country_code);
  // Function that updates the watch providers dynamically
  if (wp_results[country_code] === undefined) {
    $( '#missing_country' ).append( '<p>Unfortunately we aren\'t able to get provider information for your country. If there is anywhere else you would like to try please select from the list below. 🙂</p>' );
    return;
  }
  const stream_providers = wp_results[country_code].flatrate;
  const buy_providers = wp_results[country_code].buy;
  const rent_providers = wp_results[country_code].rent;

  // Streaming
  if (stream_providers === undefined) {
    var stream_slot = document.createElement('div');
    stream_slot.classList.add('col-10');
    stream_slot.innerHTML = '<p>Unfortunately there is nowhere to stream this movie in ' + country + ' 😔';
    stream_parent.appendChild(stream_slot);
  } else {
    for (var i=0; i < stream_providers.length; i++) {
      var img_src = 'https://image.tmdb.org/t/p/w500/' + stream_providers[i].logo_path;

      var stream_slot = document.createElement('div');
      stream_slot.classList.add('col-xl-2', 'col-lg-2', 'col-md-3', 'col-sm-4', 'col-4'); ;
      stream_slot.innerHTML = '<img title="' + stream_providers[i].provider_name + '" style="width:60px;border-radius:5px" src="' + img_src + '" alt="' + stream_providers[i].provider_name + '"/>';
      stream_parent.appendChild(stream_slot);
    }
  }


  // Rentals
  if (rent_providers === undefined) {
    var rent_slot = document.createElement('div');
    rent_slot.classList.add('col-10');
    rent_slot.innerHTML = '<p>Unfortunately there is nowhere to rent this movie in ' + country + ' 😔';
    rent_parent.appendChild(rent_slot);
  } else {
    for (var i=0; i < rent_providers.length; i++) {
      var img_src = 'https://image.tmdb.org/t/p/w500/' + rent_providers[i].logo_path;

      var rent_slot = document.createElement('div');
      rent_slot.classList.add('col-xl-2', 'col-lg-2', 'col-md-3', 'col-sm-4', 'col-4');
      rent_slot.innerHTML = '<img title="' + rent_providers[i].provider_name + '" style="width:60px;border-radius:5px;padding-top: 10px" src="' + img_src + '" alt="' + rent_providers[i].provider_name + '"/>';
      rent_parent.appendChild(rent_slot);
    }
  }

  // Purchases
  if (buy_providers === undefined) {
    var buy_slot = document.createElement('div');
    buy_slot.classList.add('col-10');
    buy_slot.innerHTML = '<p>Unfortunately there is nowhere to purchase this movie in ' + country + ' 😔';
    buy_parent.appendChild(buy_slot);
  } else {
    for (var i=0; i < buy_providers.length; i++) {
      var img_src = 'https://image.tmdb.org/t/p/w500/' + buy_providers[i].logo_path;

      var buy_slot = document.createElement('div');
      buy_slot.classList.add('col-xl-2', 'col-lg-2', 'col-md-3', 'col-sm-4', 'col-4'); ;
      buy_slot.innerHTML = '<img title="' + buy_providers[i].provider_name + '" style="width:60px;border-radius:10px;padding-bottom: 10px;" src="' + img_src + '" alt="' + buy_providers[i].provider_name + '"/>';
      buy_parent.appendChild(buy_slot);
    }
  }
}
