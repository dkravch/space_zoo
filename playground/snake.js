const fs = require('fs');

try {
  const data = fs.readFileSync('./test.txt', 'utf8');
  // console.log(data);


 const lines = data.split('\n');

} catch (err) {
  console.error(err);
}