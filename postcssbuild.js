module.exports = {
	"notify" : true,
	
	"dir": "src/styles/",
	
	"output": "css/main.min.css",

	"plugins": [ "autoprefixer", "cssnano" ],

	"options": {
		"autoprefixer": {
			"browsers": ["> 1%", "IE 7"],
			"cascade": false
		},

		"cssnano": { "safe": true }
	}
}