# **iizu.me**


<div align="center">
<img src=".repo/icon.png" alt='Project banner' height='150px'>

**free and open source API for browsing and downloading manga.**

![CircleCI](https://img.shields.io/circleci/build/github/ottxrgxist/iizume/master?label=master&style=flat-square)
![CircleCI](https://img.shields.io/circleci/build/github/ottxrgxist/iizume/dev?label=dev&style=flat-square)
![Codacy coverage](https://img.shields.io/codacy/coverage/3fcc1ed5d7c84dc8a8ebc1ffe9ca56d6?style=flat-square)
[![GitHub issues](https://img.shields.io/github/issues/ottxrgxist/iizume?style=flat-square)](https://github.com/ottxrgxist/iizume/issues)
![GitHub pull requests](https://img.shields.io/github/issues-pr/songmawa/iizume?style=flat-square)
[![GitHub license](https://img.shields.io/github/license/ottxrgxist/iizume?style=flat-square)](https://github.com/ottxrgxist/iizume/blob/master/LICENSE)

</div>

## Getting Started

### Dependancies

- [ruby](https://www.ruby-lang.org/en/) >= 2.7.0
- [nodejs](https://nodejs.org/) >= 12.18.4
- [chrome](https://www.google.com/chrome/) >= 89
#### Tools
- [yarn](https://classic.yarnpkg.com/) >= 1.22.10
#### Other
- [MySQL](https://www.mysql.com/) or [MariaDB](https://mariadb.org/)
### Installing

#### 1. Download required libraries.
```sh
# Install all ruby libraries`:
gem install nokogiri ferrum
# Install all node libraries`:
yarn install
```

#### 2. Configure database connection (MySQL or MariaDB).
Create a file `config.json` in the `db` directory. Complete it using `db/config-example.json` as an example.
```sh
# create db configuration
touch db/config.json
# edit db configuration
vim db/config.json
```

### Building
#### 1. Transpile typescript
```sh
yarn build
```

### Running

#### 1. Start cron jobs
```sh
# TODO
```

#### 2. Start servers
```sh
yarn start:main
yarn start:jobs
```

### Testing
Test the application using the rake task
```sh
yarn jest
# or
yarn test
```

## Documentation

Specifications & design documents can be found in the [wiki](/wiki).

## See Also

- **iizu.me-app - https://github.com/songmawa/iizu.me-app**

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for a in depth view.

## Credits

Please see [CREDITS.md](CREDITS.md) for a in depth view.

## License

This project is licensed under the **GPL-3.0** License - see the [LICENSE](LICENSE) file for details.
