export class ConfigurationService {
  getPort() {
    return +process.env.PORT || 3000;
  }
}
