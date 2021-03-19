# **iizu.me**


<div align="center">
<img src="res/repo/banner.png" alt='Project banner' height='100px'>

**free and open source API for browsing and downloading manga.**

![Codacy coverage](https://img.shields.io/codacy/coverage/3fcc1ed5d7c84dc8a8ebc1ffe9ca56d6?style=flat-square)
![CircleCI](https://img.shields.io/circleci/build/github/songmawa/iizu.me?style=flat-square)
[![GitHub issues](https://img.shields.io/github/issues/songmawa/iizu.me?style=flat-square)](https://github.com/songmawa/iizu.me/issues)
![GitHub pull requests](https://img.shields.io/github/issues-pr/songmawa/iizu.me?style=flat-square)
[![GitHub license](https://img.shields.io/github/license/songmawa/iizu.me?style=flat-square)](https://github.com/songmawa/iizu.me/blob/master/LICENSE)

</div>

## Getting Started

### Dependancies
- Ruby >= 2.7.0
- rake >= 13.0.0
- bundler >= 2.2.0
- rspec >= 3.0.0

### Installing
Install all of the required libraires using bundler:
```
bundle install
```

### Running
Run the application using the rake task or bundler
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

This project is licensed under the **GPL-3.0** License - see the [LICENSE.md](LICENSE.md) file for details.
