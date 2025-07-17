import { nextTestSetup } from 'e2e-utils'
import type * as Playwright from 'playwright'
import { createRouterAct } from '../router-act'

describe('<Link prefetch={true}> (dynamic)', () => {
  const { next, isNextDev } = nextTestSetup({
    files: __dirname,
  })
  if (isNextDev) {
    it('disabled in development', () => {})
    return
  }

  describe.each([
    { description: 'in a page', prefix: '/in-page' },
    { description: 'in a private cache', prefix: '/in-private-cache' },
  ])('$description', ({ prefix }) => {
    it('includes dynamic params, but not dynamic content', async () => {
      let page: Playwright.Page
      const browser = await next.browser('/', {
        beforePageLoad(p: Playwright.Page) {
          page = p
        },
      })
      const act = createRouterAct(page)

      // Reveal the link to trigger a dynamic prefetch for one value of the dynamic param
      await act(async () => {
        const linkToggle = await browser.elementByCss(
          `input[data-link-accordion="${prefix}/dynamic-params/123"]`
        )
        await linkToggle.click()
      }, [
        // Should allow reading dynamic params
        {
          includes: 'Param: 123',
        },
        // Should not prefetch the dynamic content
        {
          includes: 'Dynamic content',
          block: 'reject',
        },
      ])

      // Reveal the link to trigger a dynamic prefetch for a different value of the dynamic param
      await act(async () => {
        const linkToggle = await browser.elementByCss(
          `input[data-link-accordion="${prefix}/dynamic-params/456"]`
        )
        await linkToggle.click()
      }, [
        // Should allow reading dynamic params
        {
          includes: 'Param: 456',
        },
        // Should not prefetch the dynamic content
        {
          includes: 'Dynamic content',
          block: 'reject',
        },
      ])

      // Navigate to the page
      await act(async () => {
        await act(
          async () => {
            await browser
              .elementByCss(`a[href="${prefix}/dynamic-params/123"]`)
              .click()
          },
          {
            // Temporarily block the navigation request.
            // The dynamically prefetched parts of the tree should be visible before it finishes.
            includes: 'Dynamic content',
            block: true,
          }
        )
        expect(await browser.elementById('param-value').text()).toEqual(
          'Param: 123'
        )
      })
      // After navigating, we should see both the parts that we prefetched and dynamic content.
      expect(await browser.elementById('param-value').text()).toEqual(
        'Param: 123'
      )
      expect(await browser.elementById('dynamic-content').text()).toEqual(
        'Dynamic content'
      )

      await browser.back()

      // Reveal the link to the second page again. It should not be prefetched again
      await act(async () => {
        const linkToggle = await browser.elementByCss(
          `input[data-link-accordion="${prefix}/dynamic-params/456"]`
        )
        await linkToggle.click()
      }, 'no-requests')

      // Navigate to the other page
      await act(async () => {
        await act(
          async () => {
            await browser
              .elementByCss(`a[href="${prefix}/dynamic-params/456"]`)
              .click()
          },
          {
            // Temporarily block the navigation request.
            // The dynamically prefetched parts of the tree should be visible before it finishes.
            includes: 'Dynamic content',
            block: true,
          }
        )
        expect(await browser.elementById('param-value').text()).toEqual(
          'Param: 456'
        )
      })
      // After navigating, we should see both the parts that we prefetched and dynamic content.
      expect(await browser.elementById('param-value').text()).toEqual(
        'Param: 456'
      )
      expect(await browser.elementById('dynamic-content').text()).toEqual(
        'Dynamic content'
      )
    })

    it('includes search params, but not dynamic content', async () => {
      let page: Playwright.Page
      const browser = await next.browser('/', {
        beforePageLoad(p: Playwright.Page) {
          page = p
        },
      })
      const act = createRouterAct(page)

      // Reveal the link to trigger a dynamic prefetch for one value of the search param
      await act(async () => {
        const linkToggle = await browser.elementByCss(
          `input[data-link-accordion="${prefix}/search-params?searchParam=123"]`
        )
        await linkToggle.click()
      }, [
        // Should allow reading search params
        {
          includes: 'Search param: 123',
        },
        // Should not prefetch the dynamic content
        {
          includes: 'Dynamic content',
          block: 'reject',
        },
      ])

      // Reveal the link to trigger a dynamic prefetch for a different value of the search param
      await act(async () => {
        const linkToggle = await browser.elementByCss(
          `input[data-link-accordion="${prefix}/search-params?searchParam=456"]`
        )
        await linkToggle.click()
      }, [
        // Should allow reading search params
        {
          includes: 'Search param: 456',
        },
        // Should not prefetch the dynamic content
        {
          includes: 'Dynamic content',
          block: 'reject',
        },
      ])

      // Navigate to the page
      await act(async () => {
        await act(
          async () => {
            await browser
              .elementByCss(`a[href="${prefix}/search-params?searchParam=123"]`)
              .click()
          },
          {
            // Temporarily block the navigation request.
            // The dynamically prefetched parts of the tree should be visible before it finishes.
            includes: 'Dynamic content',
            block: true,
          }
        )
        expect(await browser.elementById('search-param-value').text()).toEqual(
          'Search param: 123'
        )
      })
      // After navigating, we should see both the parts that we prefetched and dynamic content.
      expect(await browser.elementById('search-param-value').text()).toEqual(
        'Search param: 123'
      )
      expect(await browser.elementById('dynamic-content').text()).toEqual(
        'Dynamic content'
      )

      await browser.back()

      // Reveal the link to the second page again. It should not be prefetched again
      await act(async () => {
        const linkToggle = await browser.elementByCss(
          `input[data-link-accordion="${prefix}/search-params?searchParam=456"]`
        )
        await linkToggle.click()
      }, 'no-requests')

      // Navigate to the other page
      await act(
        async () => {
          await browser
            .elementByCss(`a[href="${prefix}/search-params?searchParam=456"]`)
            .click()
        },
        {
          // Now the dynamic content should be fetched
          includes: 'Dynamic content',
        }
      )
      expect(await browser.elementById('search-param-value').text()).toEqual(
        'Search param: 456'
      )
      expect(await browser.elementById('dynamic-content').text()).toEqual(
        'Dynamic content'
      )
    })

    it('includes cookies, but not dynamic content', async () => {
      let page: Playwright.Page
      const browser = await next.browser('/', {
        beforePageLoad(p: Playwright.Page) {
          page = p
        },
      })
      // Clear cookies after the test. This currently doesn't happen automatically.
      await using _ = defer(() => browser.deleteCookies())

      const act = createRouterAct(page)

      await browser.addCookie({ name: 'testCookie', value: 'initialValue' })

      // Reveal the link to trigger a dynamic prefetch for the initial cookie value
      await act(async () => {
        const linkToggle = await browser.elementByCss(
          `input[data-link-accordion="${prefix}/cookies"]`
        )
        await linkToggle.click()
      }, [
        // Should allow reading cookies
        {
          includes: 'Cookie: initialValue',
        },
        // Should not prefetch the dynamic content
        {
          includes: 'Dynamic content',
          block: 'reject',
        },
      ])

      // Navigate to the page
      await act(async () => {
        await act(
          async () => {
            await browser.elementByCss(`a[href="${prefix}/cookies"]`).click()
          },
          {
            // Temporarily block the navigation request.
            // The dynamically prefetched parts of the tree should be visible before it finishes.
            includes: 'Dynamic content',
            block: true,
          }
        )
        expect(await browser.elementById('cookie-value').text()).toEqual(
          'Cookie: initialValue'
        )
      })
      // After navigating, we should see both the parts that we prefetched and dynamic content.
      expect(await browser.elementById('cookie-value').text()).toEqual(
        'Cookie: initialValue'
      )
      expect(await browser.elementById('dynamic-content').text()).toEqual(
        'Dynamic content'
      )

      // Update the cookie via a server action.
      // This should cause the client cache to be dropped,
      // so the page should get prefetched again when the link becomes visible
      await browser.elementByCss('input[name="cookie"]').type('updatedValue')
      await browser.elementByCss('[type="submit"]').click()

      // Go back to the previous page
      await browser.back()

      // Reveal the link again to trigger a dynamic prefetch for the new value of the cookie
      await act(async () => {
        const linkToggle = await browser.elementByCss(
          `input[data-link-accordion="${prefix}/cookies"]`
        )
        await linkToggle.click()
      }, [
        // Should allow reading dynamic params
        {
          includes: 'Cookie: updatedValue',
        },
        // Should not prefetch the dynamic content
        {
          includes: 'Dynamic content',
          block: 'reject',
        },
      ])

      // Navigate to the page
      await act(async () => {
        await act(
          async () => {
            await browser.elementByCss(`a[href="${prefix}/cookies"]`).click()
          },
          {
            includes: 'Dynamic content',
            block: true,
          }
        )
        expect(await browser.elementById('cookie-value').text()).toEqual(
          'Cookie: updatedValue'
        )
      })

      expect(await browser.elementById('cookie-value').text()).toEqual(
        'Cookie: updatedValue'
      )
      expect(await browser.elementById('dynamic-content').text()).toEqual(
        'Dynamic content'
      )
    })

    it('can completely prefetch a page that uses cookies and no uncached IO', async () => {
      let page: Playwright.Page
      const browser = await next.browser('/', {
        beforePageLoad(p: Playwright.Page) {
          page = p
        },
      })
      // Clear cookies after the test. This currently doesn't happen automatically.
      await using _ = defer(() => browser.deleteCookies())

      const act = createRouterAct(page)

      await browser.addCookie({ name: 'testCookie', value: 'initialValue' })

      // Reveal the link to trigger a dynamic prefetch for the initial cookie value
      await act(async () => {
        const linkToggle = await browser.elementByCss(
          `input[data-link-accordion="${prefix}/cookies-only"]`
        )
        await linkToggle.click()
      }, [
        // Should allow reading cookies
        {
          includes: 'Cookie: initialValue',
        },
      ])

      // Navigate to the page.
      await act(
        async () => {
          await browser.elementByCss(`a[href="${prefix}/cookies-only"]`).click()
        },
        // The page doesn't use any other IO, so we prefetched it completely, and shouldn't issue any more requests.
        'no-requests'
      )
      expect(await browser.elementById('cookie-value').text()).toEqual(
        'Cookie: initialValue'
      )
    })
  })

  it('can completely prefetch a page that is fully static', async () => {
    let page: Playwright.Page
    const browser = await next.browser('/', {
      beforePageLoad(p: Playwright.Page) {
        page = p
      },
    })

    const act = createRouterAct(page)

    // Reveal the link to trigger a dynamic prefetch for the page
    await act(async () => {
      const linkToggle = await browser.elementByCss(
        `input[data-link-accordion="/fully-static"]`
      )
      await linkToggle.click()
    }, [
      {
        includes: 'Hello from a fully static page!',
      },
    ])

    // Navigate to the page.
    await act(
      async () => {
        await browser.elementByCss(`a[href="/fully-static"]`).click()
      },
      // The page doesn't use any IO, so we prefetched it completely, and shouldn't issue any more requests.
      'no-requests'
    )
    expect(await browser.elementByCss('p#intro').text()).toBe(
      'Hello from a fully static page!'
    )
  })

  describe('cache stale time handling', () => {
    it('includes short-lived public caches with a long enough staleTime', async () => {
      // If a cache has an expiration time under 5min (DYNAMIC_EXPIRE), we omit it from static prerenders.
      // However, it should still be included in a dynamic prefetch if it's stale time is above 30s. (DYNAMIC_PREFETCH_DYNAMIC_STALE)

      let page: Playwright.Page
      const browser = await next.browser('/', {
        beforePageLoad(p: Playwright.Page) {
          page = p
        },
      })
      const act = createRouterAct(page)

      const STATIC_CONTENT = 'This page uses a short-lived public cache'
      const DYNAMICALLY_PREFETCHABLE_CONTENT = 'Short-lived cached content'

      // Reveal the link to trigger a static prefetch
      await act(async () => {
        const linkToggle = await browser.elementByCss(
          `input[data-prefetch="auto"][data-link-accordion="/caches/public-short-expire-long-stale"]`
        )
        await linkToggle.click()
      }, [
        // Should include the static shell
        {
          includes: STATIC_CONTENT,
        },
        // Should not include the short-lived cache
        // (We set the `expire` value to be under 5min, so it will be excluded from prerenders)
        {
          includes: DYNAMICALLY_PREFETCHABLE_CONTENT,
          block: 'reject',
        },
      ])

      // Reveal the link to trigger a dynamic prefetch
      await act(async () => {
        const linkToggle = await browser.elementByCss(
          `input[data-prefetch="dynamic"][data-link-accordion="/caches/public-short-expire-long-stale"]`
        )
        await linkToggle.click()
      }, [
        // Should include the short-lived cache
        // (We set `stale` to be above 30s, which means it shouldn't be omitted)
        {
          includes: DYNAMICALLY_PREFETCHABLE_CONTENT,
        },
      ])

      // Navigate to the page. We didn't include any uncached IO, so the page is fully prefetched,
      // and this shouldn't issue any more requests
      await act(async () => {
        await browser
          .elementByCss(`a[href="/caches/public-short-expire-long-stale"]`)
          .click()
      }, 'no-requests')

      expect(await browser.elementByCss('main').text()).toInclude(
        DYNAMICALLY_PREFETCHABLE_CONTENT
      )
    })

    it('omits short-lived public caches with a short enough staleTime', async () => {
      // If a cache has a stale time below 30s (DYNAMIC_PREFETCH_DYNAMIC_STALE), we should omit it from dynamic prefetches.

      let page: Playwright.Page
      const browser = await next.browser('/', {
        beforePageLoad(p: Playwright.Page) {
          page = p
        },
      })
      const act = createRouterAct(page)

      const STATIC_CONTENT = 'This page uses a short-lived public cache'
      const DYNAMIC_CONTENT = 'Short-lived cached content'

      // Reveal the link to trigger a static prefetch
      await act(async () => {
        const linkToggle = await browser.elementByCss(
          `input[data-prefetch="auto"][data-link-accordion="/caches/public-short-expire-short-stale"]`
        )
        await linkToggle.click()
      }, [
        // Should include the static shell
        {
          includes: STATIC_CONTENT,
        },
        // Should not include the short-lived cache
        // (We set the `expire` value to be under 5min, so it will be excluded from prerenders)
        {
          includes: DYNAMIC_CONTENT,
          block: 'reject',
        },
      ])

      // Reveal the link to trigger a dynamic prefetch.
      // It'll essentially be the same as the static prefetch, because the only dynamic hole
      // will be omitted from both.
      // (NOTE: in the future, we might prevent scenarios like this via `generatePrefetch`)
      await act(async () => {
        const linkToggle = await browser.elementByCss(
          `input[data-prefetch="dynamic"][data-link-accordion="/caches/public-short-expire-short-stale"]`
        )
        await linkToggle.click()
      }, [
        // Should include the shell
        {
          includes: STATIC_CONTENT,
        },
        // Should not include the short-lived cache
        // (We set the `stale` value to be under 30s, so it will be excluded from dynamic prerenders)
        {
          includes: DYNAMIC_CONTENT,
          block: 'reject',
        },
      ])

      // Navigate to the page
      await act(async () => {
        await act(
          async () => {
            await browser
              .elementByCss(`a[href="/caches/public-short-expire-short-stale"]`)
              .click()
          },
          {
            // Temporarily block the navigation request.
            // The prefetched parts of the tree should be visible before it finishes.
            includes: DYNAMIC_CONTENT,
            block: true,
          }
        )
        expect(await browser.elementById('intro').text()).toInclude(
          STATIC_CONTENT
        )
      })

      // After navigating, we should see both the parts that we prefetched and the short lived cache.
      expect(await browser.elementById('intro').text()).toInclude(
        STATIC_CONTENT
      )
      expect(await browser.elementById('cached-value').text()).toMatch(/\d+/)
    })

    it('omits private caches with a short enough staleTime', async () => {
      // If a cache has a stale time below 30s (DYNAMIC_PREFETCH_DYNAMIC_STALE), we should omit it from dynamic prefetches.

      let page: Playwright.Page
      const browser = await next.browser('/', {
        beforePageLoad(p: Playwright.Page) {
          page = p
        },
      })
      const act = createRouterAct(page)

      const STATIC_CONTENT = 'This page uses a short-lived private cache'
      const DYNAMIC_CONTENT = 'Short-lived cached content'

      // Reveal the link to trigger a static prefetch
      await act(async () => {
        const linkToggle = await browser.elementByCss(
          `input[data-prefetch="auto"][data-link-accordion="/caches/private-short-stale"]`
        )
        await linkToggle.click()
      }, [
        // Should include the static shell
        {
          includes: STATIC_CONTENT,
        },
        // Should not include the short-lived cache
        // (We set the `expire` value to be under 5min, so it will be excluded from prerenders)
        {
          includes: DYNAMIC_CONTENT,
          block: 'reject',
        },
      ])

      // Reveal the link to trigger a dynamic prefetch
      await act(async () => {
        const linkToggle = await browser.elementByCss(
          `input[data-prefetch="dynamic"][data-link-accordion="/caches/private-short-stale"]`
        )
        await linkToggle.click()
      }, [
        // Should include the shell
        {
          includes: STATIC_CONTENT,
        },
        // Should not prefetch the short-lived cache
        // (We set the `stale` value to be under 30s, so it will be excluded from dynamic prefetches)
        {
          includes: DYNAMIC_CONTENT,
          block: 'reject',
        },
      ])

      // Navigate to the page
      await act(async () => {
        await act(
          async () => {
            await browser
              .elementByCss(`a[href="/caches/private-short-stale"]`)
              .click()
          },
          {
            // Temporarily block the navigation request.
            // The dynamically prefetched parts of the tree should be visible before it finishes.
            includes: DYNAMIC_CONTENT,
            block: true,
          }
        )
        expect(await browser.elementById('intro').text()).toInclude(
          STATIC_CONTENT
        )
      })

      // After navigating, we should see both the parts that we prefetched and dynamic content.
      expect(await browser.elementById('intro').text()).toInclude(
        STATIC_CONTENT
      )
      const cachedValue1 = await browser.elementById('cached-value').text()
      expect(cachedValue1).toMatch(/\d+/)

      // Try navigating again. The cache is private, so we should see a different timestamp
      await browser.back()

      // Reveal the link again. The prefetch should be cached, so we shouldn't see any requests
      await act(async () => {
        const linkToggle = await browser.elementByCss(
          `input[data-link-accordion="/caches/private-short-stale"]`
        )
        await linkToggle.click()
      }, 'no-requests')

      // Navigate to the page again
      await act(async () => {
        await act(
          async () => {
            await browser
              .elementByCss(`a[href="/caches/private-short-stale"]`)
              .click()
          },
          {
            // Temporarily block the navigation request.
            // The dynamically prefetched parts of the tree should be visible before it finishes.
            includes: 'Short-lived cached content',
            block: true,
          }
        )
        expect(await browser.elementById('intro').text()).toInclude(
          STATIC_CONTENT
        )
      })

      // After navigating, we should see both the parts that we prefetched and dynamic content.
      // The private cache was omitted from the dynamic prefetch, so we didn't cache it in the router,
      // and it was not cached server-side either, so we should get a different value than the previous request.
      const cachedValue2 = await browser.elementById('cached-value').text()
      expect(cachedValue2).toMatch(/\d+/)

      expect(cachedValue1).not.toEqual(cachedValue2)
    })
  })
})

function defer(callback: () => Promise<void>) {
  return {
    [Symbol.asyncDispose]: callback,
  }
}
