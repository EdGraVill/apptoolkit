for f in *.*
do
  if [[ "$f" =~ ^("dist"|"package.json"|"node_modules"|"README.md")$ ]]
  then
    echo '';
  else
    rm -rf $f;
  fi
done

sed -i '' '/\"scripts\"/,/}/ d; /^$/d' package.json;
sed -i '' '/\"devDependencies\"/,/}/ d; /^$/d' package.json;
rm -rf src
rm -rf bin
rm .eslintrc
mv ./dist/* ./
rm -rf dist
