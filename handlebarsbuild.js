'use strict';

const Handlebars = require('handlebars');
const watchTree = require("fs-watch-tree").watchTree;
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const R = require('ramda');
const views = require('./handlebars.config.js');
const config = require('./app.config.js');
const directory = config.src.views;


const getItem = (data) => {
  return function (item) {
    return data.filter(i => {
      return i.name.split('.')[0] === item
    })[0];
  }
};


function getFiles (dir, fn, pre, suf) {
  return fs.readdirAsync(dir).map(filename => {
  	
    const filePath = dir +'/'+ filename;
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      // if path directory get its files
      const pathSplit = filePath.split('/')
      const dirName = pre || `${pathSplit[pathSplit.length - 1]}/`;

      return getFiles(filePath, fn, dirName);

    } else {
      // call callback
      return fn && fn(`${pre || ''}${filename}${suf || ''}`, filePath);
    }
  });
}


function run () {
  getFiles(directory, function (filename, filePath) {
      return {
        name: filename,
        path: filePath
      };
    })
    .then(fileMetaData => {
      const flattenFileMetaData = R.flatten(fileMetaData);

      const getFileContent = (filename, filePath) => {
        return fs.readFileAsync(filePath, "utf8");
      }


      const obj = (content) => {

        const flattenConent = R.flatten(content);
        const fn = () => {
          return flattenFileMetaData.map((f, i) => {
            return {
              name: f.name,
              content: flattenConent[i]
            }
          });
        }

        return Promise.resolve((fn()));
      }

      return R.pipeP(getFiles, obj)(directory, getFileContent)
    })
    .then(data => {

      const getDataItem = getItem(data);

      const x = R.fromPairs(data.map(i => {
        if (typeof i.name.split('-')[1] !== 'undefined') {
          return [i.name.split('.')[0].split('/')[1], i.content];
        } else {
          return [];
        }
      }));


      function buildViews (params) {
        const view = params.view;
        const output = view.output;
        const partials = view.partials;
        const outputPath = `${params.outputFolder}/${output}.html`;
        const template = params.template;

        let items;

        if (Array.isArray(partials)) {
          const reducer  = function (prev, curr) {
            const obj = {};
            const prevObj = typeof prev === 'string' ? {} : prev;

            obj[curr] = getDataItem(curr).content;
            return Object.assign({}, prevObj , obj);
          }

          items = partials.reduce(reducer, partials[0]);
        } else {
          items = getDataItem(partials);
        }


        const insert = Object.assign(
          {},
          items,
          x,
          view.data
        );


        const html = template(insert);

        fs.writeFileAsync(outputPath, html)
          .then(result => {
            console.log(`Creadted: ${output}`);
          });
      }


      //Create page
      views.forEach(view => {
        buildViews({
          outputFolder: `${config.dist.views}`,
          view: view,
          template: Handlebars.compile(getDataItem('app/scaffold').content)
        });
      });


      views.forEach(view => {
        buildViews({
          outputFolder: config.dist.views,
          view: view,
          template: Handlebars.compile(getDataItem(view.partials).content)
        });
      });
    })
    .catch(function(e) {
      console.log(e);
    });

}



if (process.argv[2] === "--watch" || process.argv[2] === "-w") {
  run();
  watchTree("./src/views", function (event) {
    run();
  });
} else {
  run();
}