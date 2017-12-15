
# tastee-npm
executable npm module for tastee 

<img src="https://tastee.github.io/img/home.png"/>

# Usage

## Install Tastee
```
git clone https://github.com/tastee/tastee-npm.git 
cd tastee-npm 
npm install -g 
```

## Launch Tastee
```
tastee -b <browser> -o <output> -e <extract> <FOLDER>
```
<browser>  is chrome or firefox.
<output>   is the path of the directory where the final report is generated.
<extract>  is the name of the extractor used. For now, it can only be html.
<FOLDER>   is a directory containing the following tastee files OR just a file.

## Example
```
tastee -b firefox starting-tastee.html 
tastee -b chrome /tmp 
tastee -b chrome -e html /tmp 
tastee -b chrome -e html -o /tmp/report/ ../tastee_folder 
```
