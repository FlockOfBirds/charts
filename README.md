# Charts

Plot and track your data across different charts.

### Available charts
* `BarChart`
* `LineChart`
* `PieChart`

## Dependencies
* Mendix 7.4.0

## Demo projects
[https://charts.mxapps.io](https://charts.mxapps.io)

## Configuration

Setting up a line or (stacked) bar chart, a dataset object represents a container for a serie of datapoints. A chart can have multiple datasets(series).

* `name` - Caption for serie.
* `Data Entity` - Entity containing the values.
* `X-axis data attribute` - The attribute that contains the X value for the data point.
* `Y-axis data attribute` - The attribute that contains the Y value for the data point.
## Issues, suggestions and feature requests
We are actively maintaining this widget, please report any issues or suggestion for improvement at [https://github.com/mendixlabs/charts/issues](https://github.com/mendixlabs/charts/issues)

## Development
Prerequisite: Install git, node package manager, webpack CLI, grunt CLI, Karma CLI

To contribute, fork and clone.

    git clone https://github.com/mendixlabs/charts

The code is in typescript. Use a typescript IDE of your choice, like Visual Studio Code or WebStorm.

To set up the development environment, run:

    npm install

Create a folder named dist in the project root.

Create a Mendix test project in the dist folder and rename its root folder to `dist/MxTestProject`.

To automatically compile, bundle and push code changes to the running test project, run:

    grunt

To run the project unit tests with code coverage, results can be found at dist/testresults/coverage/index.html, run:

    npm test

or run the test continuously during development:

    karma start
