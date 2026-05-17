import { LANG_KEY, loadLang, messages, saveLang } from '../app/i18n'

describe('i18n', () => {
  it('exports messages in both languages', () => {
    expect(messages.pt.red).toBe('VERMELHO')
    expect(messages.en.blue).toBe('BLUE')
    expect(messages.pt.setTo(12)).toBe('VENCE EM 12 PONTOS')
    expect(messages.en.setTo(12)).toBe('WIN AT 12 POINTS')
  })

  it('loads saved language and defaults to pt', () => {
    localStorage.removeItem(LANG_KEY)
    expect(loadLang()).toBe('pt')

    localStorage.setItem(LANG_KEY, 'en')
    expect(loadLang()).toBe('en')

    localStorage.setItem(LANG_KEY, 'xx')
    expect(loadLang()).toBe('pt')
  })

  it('handles storage failures on load and save', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('boom')
    })

    expect(loadLang()).toBe('pt')
    getItem.mockRestore()

    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('boom')
    })

    expect(() => saveLang('en')).not.toThrow()
    setItem.mockRestore()
  })
})
