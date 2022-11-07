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

  // Elements with the same name
  formattedObject.mediaId = mediaInfo.body.id;
  formattedObject.imageSection = {poster: mediaInfo.body.poster_path, backdrop: mediaInfo.body.backdrop_path};
  formattedObject.genreSection = mediaInfo.body.genres;
  formattedObject.taglineSection = mediaInfo.body.tagline;
  formattedObject.ratingSection = mediaInfo.body.vote_average;
  formattedObject.overviewSection = mediaInfo.body.overview;
  formattedObject.keywordsSection = mediaInfo.body.keywords.results;
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
    mediaInfo.body.credits.crew.forEach(function(value) {
      formattedObject.runtimeSection = `${mediaInfo.body.runtime} Minutes`;
      formattedObject.releaseSection = mediaInfo.body.release_date;
      formattedObject.productionSection = {name: mediaInfo.body.production_companies[0].name, logo: mediaInfo.body.production_companies[0].logo_path};
      formattedObject.directorSection = value.job == 'Director' ? value.name : false;
      if (value.job == 'Screenplay') {
        formattedObject.statusWriterSection = {title: 'Screenplay', value: value.name};
      }
      if (value.job == 'Writer') {
        formattedObject.statusWriterSection = {title: 'Writer', value: value.name};
      }
    });
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

module.exports = {
  parseMediaOutput,
  parseReccs,
};
