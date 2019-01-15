#!/bin//bash
mkdir -p "data"


if [ ! -f "data/data.csv" ]; then
  echo > "data/data.csv"
fi


echo "Fetching data..."

DATAURL="http://cbridge.dmr-taa.it:42420/data.txt?param=ajaxminimalnetwatch"
CURLOUTPUT=$(curl -s -m 50 $DATAURL)
CURLSUCCESS=$?

if [ $CURLSUCCESS -eq "0" ]; then
  echo "CURL ok, Parsing RAW DATA..."
  echo "$CURLOUTPUT" |
  sed 's/&nbsp;/ /g' |
  sed 's/ - / /g' | #Elimina gli spazi tra i nomi
  sed 's/  ITA -- / /g' |
  sed 's/ -- / /g' |
  sed 's/\t/\n/g' |
  sed 's/\v/,/g' |
  tail -n +2 > data/data.csv #Elimina la prima riga
fi
