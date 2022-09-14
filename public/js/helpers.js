/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
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
  const additionalMins = minutes % 60;

  return {'hours': hours, 'minutes': additionalMins};
}

function update_providers(streamParent, rentParent, buyParent, wpResults, countryCode, country) {
  // Function that updates the watch providers dynamically
  if (wpResults[countryCode] === undefined) {
    $( '#missing_country' ).append( `
    <p>Unfortunately we aren\'t able to get provider information for your country. 
    If there is anywhere else you would like to try please select from the list below. 🙂</p>` );
    return;
  }
  const streamProviders = wpResults[countryCode].flatrate;
  const buyProviders = wpResults[countryCode].buy;
  const rentProviders = wpResults[countryCode].rent;

  // Streaming
  if (streamProviders === undefined) {
    const streamSlot = document.createElement('div');
    streamSlot.classList.add('col-10');
    streamSlot.innerHTML = '<p>Unfortunately there is nowhere to stream this movie in ' + country + ' 😔';
    streamParent.appendChild(streamSlot);
  } else {
    for (let i=0; i < streamProviders.length; i++) {
      const imgSrc = 'https://image.tmdb.org/t/p/w500/' + streamProviders[i].logo_path;

      const streamSlot = document.createElement('div');
      streamSlot.classList.add('col-xl-2', 'col-lg-2', 'col-md-3', 'col-sm-4', 'col-4'); ;
      streamSlot.innerHTML = '<img title="' + streamProviders[i].provider_name + '" style="width:60px;border-radius:5px" src="' + imgSrc + '" alt="' + streamProviders[i].provider_name + '"/>';
      streamParent.appendChild(streamSlot);
    }
  }

  // Rentals
  if (rentProviders === undefined) {
    const rentSlot = document.createElement('div');
    rentSlot.classList.add('col-10');
    rentSlot.innerHTML = '<p>Unfortunately there is nowhere to rent this movie in ' + country + ' 😔';
    rentParent.appendChild(rentSlot);
  } else {
    for (let i=0; i < rentProviders.length; i++) {
      const imgSrc = 'https://image.tmdb.org/t/p/w500/' + rentProviders[i].logo_path;

      const rentSlot = document.createElement('div');
      rentSlot.classList.add('col-xl-2', 'col-lg-2', 'col-md-3', 'col-sm-4', 'col-4');
      rentSlot.innerHTML = '<img title="' + rentProviders[i].provider_name + '" style="width:60px;border-radius:5px;padding-top: 10px" src="' + imgSrc + '" alt="' + rentProviders[i].provider_name + '"/>';
      rentParent.appendChild(rentSlot);
    }
  }

  // Purchases
  if (buyProviders === undefined) {
    const buySlot = document.createElement('div');
    buySlot.classList.add('col-10');
    buySlot.innerHTML = '<p>Unfortunately there is nowhere to purchase this movie in ' + country + ' 😔';
    buyParent.appendChild(buySlot);
  } else {
    for (let i=0; i < buyProviders.length; i++) {
      const imgSrc = 'https://image.tmdb.org/t/p/w500/' + buyProviders[i].logo_path;

      const buySlot = document.createElement('div');
      buySlot.classList.add('col-xl-2', 'col-lg-2', 'col-md-3', 'col-sm-4', 'col-4'); ;
      buySlot.innerHTML = '<img title="' + buyProviders[i].provider_name + '" style="width:60px;border-radius:10px;padding-bottom: 10px;" src="' + imgSrc + '" alt="' + buyProviders[i].provider_name + '"/>';
      buyParent.appendChild(buySlot);
    }
  }
}
