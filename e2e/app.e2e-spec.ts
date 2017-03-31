import { RebotingPage } from './app.po';

describe('reboting App', () => {
  let page: RebotingPage;

  beforeEach(() => {
    page = new RebotingPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
