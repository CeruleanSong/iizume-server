# **iizu.me**


<div align="center">
<img src=".repo/icon.png" alt='Project banner' height='150px'>

**free and open source API for browsing and downloading manga.**

![CircleCI](https://img.shields.io/circleci/build/github/songmawa/iizu.me?label=master&style=flat-square)
![CircleCI](https://img.shields.io/circleci/build/github/songmawa/iizu.me/dev?label=dev&style=flat-square)
![Codacy coverage](https://img.shields.io/codacy/coverage/3fcc1ed5d7c84dc8a8ebc1ffe9ca56d6?style=flat-square)
[![GitHub issues](https://img.shields.io/github/issues/songmawa/iizu.me?style=flat-square)](https://github.com/songmawa/iizu.me/issues)
![GitHub pull requests](https://img.shields.io/github/issues-pr/songmawa/iizu.me?style=flat-square)
[![GitHub license](https://img.shields.io/github/license/songmawa/iizu.me?style=flat-square)](https://github.com/songmawa/iizu.me/blob/master/LICENSE)

</div>

## Getting Started

### Dependancies

- [ruby](https://www.ruby-lang.org/en/) >= 2.7.0
- [golang](https://golang.org/) >= 1.14.0
#### Tools
- [rake](https://ruby.github.io/rake/) >= 13.0.0
- [bundler](https://bundler.io/) >= 2.2.0
- [rspec](https://rspec.info/) >= 3.0.0
#### Other
- [MySQL](https://www.mysql.com/) or [MariaDB](https://mariadb.org/)
### Installing

#### 1. Download required libraries.
```sh
# Install all ruby libraries using `bundler`:
bundle install

# Install all golang libraries using `go install`:
go install
```

#### 2. Configure database connection (MySQL or MariaDB).
Create a file `db_config.yml` in the `db` directory. Complete it using `db/db_config_example.yml` as an example.
```sh
# create db configuration
touch db/db_config.yml
# edit db configuration
vim db/db_config.yml
```

### Building
#### 1. Build all golang scripts
```sh
# TODO
```

### Running

#### 1. Start cron jobs
```sh
# TODO
```

#### 2. Run the application using the rake task or with bundler
```sh
rake
# or
bundle exec puma -p ${PORT:-3000}
```

### Testing
Test the application using the rake task
```sh
rake test
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
