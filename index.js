const app = require("./app"); //express application
const config = require("./utils/config");

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
