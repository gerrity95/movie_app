/* eslint-disable max-len */
// A helper class for the media queries and functionality
const dotenv = require('dotenv');
dotenv.config();
const {
  NODE_ENV,
} = process.env;

const parseMediaOutput = (mediaInfo) => {
  // A function that receives the mediaInfo and will determine how to format it for TV vs Movies
  const formattedObject = {};
  const keywords = (typeof mediaInfo.body.keywords.keywords != 'undefined') ? mediaInfo.body.keywords.keywords : mediaInfo.body.keywords.results;

  // Elements with the same name
  formattedObject.mediaId = mediaInfo.body.id;
  formattedObject.imageSection = {poster: mediaInfo.body.poster_path, backdrop: mediaInfo.body.backdrop_path};
  formattedObject.genreSection = mediaInfo.body.genres;
  formattedObject.taglineSection = mediaInfo.body.tagline;
  formattedObject.ratingSection = mediaInfo.body.vote_average;
  formattedObject.overviewSection = mediaInfo.body.overview;
  formattedObject.keywordsSection = keywords;
  const castList = [];
  if (mediaInfo.body.credits.cast.length > 8) {
    for (const x of Array(8).keys()) {
      castList.push(mediaInfo.body.credits.cast[x]);
    }
  } else {
    mediaInfo.body.credits.cast.forEach((member) => {
      castList.push(member);
    });
  }
  formattedObject.castSection = castList;

  // Elements that will have the same title/name
  formattedObject.titleSection = typeof mediaInfo.body.title != 'undefined' ? mediaInfo.body.original_title : mediaInfo.body.original_name;

  if (NODE_ENV === 'tv') {
    formattedObject.runtimeSection = `${mediaInfo.body.number_of_seasons} Season(s)`;
    formattedObject.releaseSection = `${mediaInfo.body.first_air_date} -> ${mediaInfo.body.last_air_date}`;
    formattedObject.productionSection = {name: mediaInfo.body.networks[0].name, logo: mediaInfo.body.networks[0].logo_path};
    let directorString = '';
    mediaInfo.body.created_by.forEach((creator) => {
      directorString += `${creator.name}, `;
    });
    formattedObject.directorSection = directorString;
    const status = mediaInfo.body.in_production === false ? 'Finished' : 'Ongoing';
    formattedObject.statusWriterSection = {title: 'Status', value: status};
  } else {
    formattedObject.runtimeSection = `${mediaInfo.body.runtime} Minutes`;
    formattedObject.releaseSection = mediaInfo.body.release_date;
    if (mediaInfo.body.production_companies.length == 0) {
      formattedObject.productionSection = {name: '', logo: null};
    } else {
      formattedObject.productionSection = {name: mediaInfo.body.production_companies[0].name, logo: mediaInfo.body.production_companies[0].logo_path};
    }
    mediaInfo.body.credits.crew.forEach(function(value) {
      if (value.job == 'Director') {formattedObject.directorSection = value.name;};
      if (value.job == 'Screenplay') {
        formattedObject.statusWriterSection = {title: 'Screenplay', value: value.name};
      }
      if (value.job == 'Writer') {
        formattedObject.statusWriterSection = {title: 'Writer', value: value.name};
      }
    });
    if (typeof formattedObject.statusWriterSection === 'undefined') {
      formattedObject.statusWriterSection = {title: 'Writer', value: 'Unknown'};
    }
  }

  return formattedObject;
};

const parseReccs = (reccs) => {
  // Function to parse the recommendations and output them in a standard format
  if (NODE_ENV == 'tv') {
    const transformedArray = reccs.results.map(({
      name: title,
      ...rest
    }) => ({
      title,
      ...rest,
    }));
    return transformedArray;
  }
  return reccs.results;
};

const filterBlocklist = (reccObject) => {
  // Function that will remove movies in the blocklist from the recommendations
  // eslint-disable-next-line prefer-const
  let filteredReccs =[];
  const mediaRecommendations = reccObject.reccomendations.recommendations;
  for (let i = 0; i < mediaRecommendations.length; i++) {
    if (!mediaRecommendations[i]['blocklist'] || !mediaRecommendations[i]['blocklist'] === undefined) {
      filteredReccs.push(mediaRecommendations[i]);
    }
  }
  reccObject.reccomendations.recommendations = [...filteredReccs];
  return reccObject;
};

module.exports = {
  parseMediaOutput,
  parseReccs,
  filterBlocklist,
};
