const fs = require("fs");
const path = require("path");

const ejs = require("ejs");
const Handlebars = require("handlebars");

function createEjsViewEngine(viewsDirectory) {
  const layoutPath = path.join(viewsDirectory, "layouts", "main.hbs");
  const headerPath = path.join(viewsDirectory, "partials", "header.hbs");
  const footerPath = path.join(viewsDirectory, "partials", "footer.hbs");

  return async function renderEjsWithHandlebars(filePath, options, callback) {
    try {
      const [content, layoutSource, headerSource, footerSource] =
        await Promise.all([
          ejs.renderFile(filePath, options),
          fs.promises.readFile(layoutPath, "utf8"),
          fs.promises.readFile(headerPath, "utf8"),
          fs.promises.readFile(footerPath, "utf8"),
        ]);

      const layout = Handlebars.compile(layoutSource);
      const html = layout(
        {
          ...options,
          body: new Handlebars.SafeString(content),
        },
        {
          partials: {
            header: headerSource,
            footer: footerSource,
          },
        }
      );

      callback(null, html);
    } catch (error) {
      callback(error);
    }
  };
}

module.exports = createEjsViewEngine;
