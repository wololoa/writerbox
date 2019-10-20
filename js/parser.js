
// example text for testing
/*
var text = `this is a text lol
with some.   ahist !
oh no! i dont know  what im doing because   this is bd
     omg !
  - wow this is bad
something else
  yey

"lol! wtf is This shit" - she asked
 and here we will try to do something good :)
`;
*/


var DELIMITERS = "¿¡?!.",
    SOFT_SEPARATORS = ":;,",
    LINES_PER_PAGE = 27,
    STATS = {
        words:      0,
        sentences:  0,
        lines:      0,
        pages:      0,
        characters: 0
    };


function isString (value) 
{
    return typeof value === 'string' || value instanceof String;
}

function isLetter(c) 
{
    if(!c || !isString(c)) return false;
    return c.toLowerCase() != c.toUpperCase();
}

// Used to determine whether we should mark the end of a sentence
function isEndOfSentence(c)
{
    if(!c || c.length < 1) return false;
    return DELIMITERS.includes(c) || SOFT_SEPARATORS.includes(c); // mini hack: comma isn't used for making the next uppercase, but we cannot end the line with that one!
}

// delimiters are hard separators that need to be considered (should add . at the end of those)
function containsDelimiter(word)
{
    for(var i = 0; i < DELIMITERS.length; i++)
    {
        if(word.includes(DELIMITERS[i])) return true;
    }
    return false;
}

/*
String.prototype.replaceAt = function(index, replacement) 
{
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}
*/


/*
 * Receives a line of text that can contain sentences. Splits the sentences, fixes dots and uppercase.
 */
function parseSentence(text)
{
    var newWord = true,
        first = "",
        word = "",
        words = text.split(" "),
        ret = "",
        space = "";

    for(var i = 0; i < words.length; i++)
    {
        /*
        if(words[i].length < 1)
        {
            ret += "\n";
            continue;
        }*/

        // the current active word we are parsing
        word = words[i];

        // if this is the first word in a sentence - capitalize the first letter
        if(newWord)
        {
            /*
                cases:
                # s - symbol + next needs to be upper case
                #sss - start with symbols + next need to be upper case
                s - single letter - needs to be uppercase
             */

            // the first character isn't a letter
            if(!isLetter(word[0]))
            {
                // iterate until we find the first real character
                for(var j = 0; j < word.length; j++)
                {                
                    // if we found the first character: build a new word making this first real character uppercase
                    if(isLetter(word[j]))
                    {
                        first = word[j].toUpperCase();
                        word = word.substring(0, j) + first + word.substr(j + 1);
                        newWord = false; // we found our new word - so far. Later on we will check if we should reset this again
                        break;
                    }
                }
                words[i] = word;
            }
            // the first character is a letter - make it uppercase
            else
            {
                first = (word[0]).toUpperCase();
                words[i] = first + words[i].substr(1);
                newWord = false;
            }
        }

        // flag used to capitalize the next word after we close this sentence (should re-split, but this is easier)
        if(containsDelimiter(words[i]))
        {
            newWord = true;
        }

        // construct back the sentence properly
        space = (i < words.length - 1) ? " " : "";
        ret += words[i] + space;
    }

    return ret;
}


/*
 * Given a line of text (that is a block that starts and ends before a \n), parses it and splits into sentences within.
 */
function parseLine(line)
{
    var sentences = line.split("."), // split sentences by dot - first and simplest way to split lines in sentences
        sentence = "",
        last = "",
        final = "",
        space = "";

    // empty lines are returned right away
    if(line.length < 1)
    {
        return "";
    }

    for(var i = 0; i < sentences.length; i++)
    {
        // trim empty spaces at the beginning and end
        sentence = sentences[i].trim();

        // remove additional spaces between delimiters and words - if any
        for(var j = 0; j < DELIMITERS.length - 1; j++)
        {
            d = DELIMITERS[j];
            sentence = sentence.replace(" " + d, d);
        }

        // put back final dots - without duplicating final delimiters
        last = sentence[sentence.length - 1];
        if(last && !isEndOfSentence(last))
        {
            sentence += ".";
        }

        // remove not needed empty spaces (the final edition)
        sentences[i] = parseSentence(sentence.replace(/  +/g, ' ')); 

        space = (i < sentences.length - 1) ? " " : "";
        final += sentences[i] + space;
    }

    return final;
}


/*
 * Main function: given a bunch of text, this will process it and return the "fixed" version. This respects \n, but otherwise modifies the text:
 * - removes empty spaces: trim, trail and spaces between words and signs (exclamation, question, etc)
 * - adds . at the end of each sentence (respecting signs and punctuations)
 * - marks the first word of each sentence as uppercase. Works within sentences and also with words not starting with characters. Examples:
 *     -wow > -Wow
 *     "she said - no! this is bad" > "Se said - no! This is bad"
 */
function process(text)
{
    var lines = text.split("\n"),
        line = "",
        processed = "";

    for(var i = 0; i < lines.length; i++)
    {
        line = parseLine(lines[i]);
        processed += line + "\n";
    }

    // remove not needed \n
    processed = processed.replace(/^\s+|\s+$/g, '');
    return processed;
}


function calculateStats(text)
{
    // reset the stats counter.
    STATS.words = STATS.lines = STATS.sentences = STATS.pages = 0;

    var lines = text.split("\n"),
        line = "",
        dots = 0,
        clean = text.replace(/  +/g, ' '),
        words = clean.split(" "),
        affirmation = 0,
        question = 0;
    
    for(var i = 0; i < lines.length; i++)
    {
        line = lines[i];

        dots = line.split('.').length - 1;
        affirmation = line.split('!').length - 1;
        question = line.split('?').length - 1;
        STATS.sentences += dots + affirmation + question;
    }

    STATS.words = words.length + 1;    
    STATS.lines = lines.length;
    STATS.pages = parseInt(STATS.lines / LINES_PER_PAGE) + 1;    
    STATS.characters = text.length;
}
