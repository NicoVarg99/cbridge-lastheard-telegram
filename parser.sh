#!/bin//bash

TEMPFILEPATH="/tmp/dmrdata/data.csv"
REMOTE_HOST=`cat data/remotehost`

install -D /dev/null $TEMPFILEPATH #Crate empty file

echo "Fetching data..."

DATAURL="http://$REMOTE_HOST:42420/data.txt?param=ajaxminimalnetwatch"
CURLOUTPUT=$(curl -s -m 50 $DATAURL)
CURLSUCCESS=$?

if [ $CURLSUCCESS -eq "0" ]; then
  echo "CURL ok, Parsing RAW DATA..."
  echo "$CURLOUTPUT" |
  sed 's/&nbsp;/ /g' |
  sed 's/ - / /g' | #Elimina gli spazi tra i nomi
  sed 's/  ITA -- //g' |
  sed 's/ -- / /g' |
  sed 's/\t/\n/g' |
  sed 's/\v/,/g' |
  sed 's/\v/,/g' | #Elimina i backspace
  tail -n +2 > /tmp/dmrdata/data.csv #Elimina la prima riga
fi
