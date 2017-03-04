import { MapperPage } from './app.po';

describe('mapper App', () => {
  let page: MapperPage;

  beforeEach(() => {
    page = new MapperPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
