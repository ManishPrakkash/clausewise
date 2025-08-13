# Hugging Face Service Tests

This directory contains comprehensive tests for the Hugging Face service API key functionality in your chatbot.

## Test Coverage

The tests cover the following scenarios:

### 🔑 API Key Configuration
- ✅ Valid API key initialization
- ❌ Invalid API key handling
- ❌ Missing API key handling
- ❌ Empty API key string handling

### 🚀 Service Initialization
- ✅ Success logging with valid API key
- ⚠️ Warning logging with invalid API key

### 📊 API Availability Checks
- ✅ Service availability status
- ❌ Service unavailability status

### 🛡️ Error Handling
- ❌ Error throwing for unconfigured service
- ✅ Graceful API error handling with fallback responses

### 🔄 Fallback Behavior
- ✅ Fallback responses when API is unavailable
- ✅ Meaningful fallback responses for different question types

### 🏗️ Context Building
- ✅ Proper context construction from document data
- ✅ Document content integration

### 📡 API Response Handling
- ✅ Successful API response processing
- ✅ Empty response fallback handling

## Running the Tests

### Prerequisites
First, install the testing dependencies:
```bash
npm install
```

### Run All Tests
```bash
npm run test:run
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Specific Test File
```bash
npx vitest run src/utils/__tests__/huggingFaceService.test.js
```

## Test Environment Setup

The tests use:
- **Vitest** as the testing framework
- **jsdom** for DOM environment simulation
- **Mocking** for external dependencies
- **Environment variable mocking** for API key testing

## Mocking Strategy

- **@huggingface/inference**: Mocked to avoid actual API calls
- **Environment Variables**: Mocked to test different API key scenarios
- **Console Methods**: Mocked to avoid test output noise
- **Module System**: Reset between tests for clean state

## Test Data

The tests use sample document data including:
- Land contracts
- Property documents
- Survey information
- Owner details
- Location data

## Expected Behavior

### With Valid API Key
- Service initializes successfully
- API calls are made to Hugging Face
- Responses are processed normally
- Fallback responses are used only on API errors

### Without Valid API Key
- Service initializes in fallback mode
- No API calls are made
- All responses use fallback logic
- Graceful degradation of functionality

## Troubleshooting

### Common Issues

1. **Module Import Errors**: Ensure all dependencies are installed
2. **Environment Variable Issues**: Check that mocking is working correctly
3. **Test Isolation**: Each test should run independently

### Debug Mode
Run tests with verbose output:
```bash
npx vitest run --reporter=verbose
```

## Contributing

When adding new tests:
1. Follow the existing test structure
2. Use descriptive test names
3. Test both success and failure scenarios
4. Mock external dependencies appropriately
5. Ensure tests are isolated and repeatable
