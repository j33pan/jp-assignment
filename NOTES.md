## What changes would I make if I were given 2 weeks time?

1. Develop a new endpoint for streaming while retaining the original one as a fallback. Continue using the existing endpoint until the new one is fully operational.
2. Move the endpoint call to the `api` folder and replace hardcoded URLs in components with the already defined constant.
3. Investigate alternatives to mitigate potential risks associated with using `dangerouslySetInnerHTML`.
4. Run the project locally to identify and address bugs or areas for improvement.
5. Modularize frontend logic.
6. Implement comprehensive test coverage.
