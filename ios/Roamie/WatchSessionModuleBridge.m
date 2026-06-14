#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WatchSessionModule, NSObject)

RCT_EXTERN_METHOD(sendAccessToken:(NSString *)token
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(clearAccessToken:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
