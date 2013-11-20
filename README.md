Schwa.cc
==========
Schwa is a spaced interval flashcard webapp/Chrome extension. Basic functionality is complete, but it's very much still in progress. Use at your own risk!

It was born out of the tedious process I experienced when trying to make my own flashcards while studying Korean. The steps involved were something like this: Highlight the words you want to review later, copy, switch tabs, paste, find translation, copy, paste, sync cards to device...
Schwa does all that in just a few seconds! 

The Stack
_________________

The server is built with Node.js and uses the Mongoose ORM to interact with a MongoDB database. The front-end uses Backbone.js and Handlebars--a lovely combination, in my opinion!

APIs/Algorithms
________________

Schwa uses the RESTful WordReference API to search for definitions, and implements a version of the SuperMemo algorithm originally created by Piotr Wozniak. Spanish, French, Italian, and Portugese translations are currently supported. Chinese, Japanese, Greek, and Korean are coming soon.
The Language Detection API was formerly used to detect the language of incoming text. However, it proved to not be accurate enough to be userful for short words and phrases. C'est la vie. In the future, I might add a feature that autotranslates only if the confidence score is high for a particular language. 





To run the webapp locally, just navigate to the root directory and execute "node app.js" from the command line.

To install the extension locally (the webapp needs to be running as well):

1. Clone the repo.

2. In Google Chrome, navigate to chrome://extensions.

3. Click "Load unpacked extension" and select the chrome_extension directory contained in the repo.



