import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './admin/admin.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProfilesModule } from './profiles/profiles.module';
import { MedicalHistoryModule } from './medical-history/medical-history.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { SeedModule } from './seed/seed.module';
import { LogsModule } from './logs/logs.module';
import { LoggerMiddleware } from './logger.middleware';
// import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
// import { Keyv, createKeyv } from '@keyv/redis';
// import { CacheableMemory } from 'cacheable';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './auth/guards';
import { CaslModule } from './casl/casl.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    DatabaseModule,
    AdminModule,
    DoctorModule,
    PatientModule,
    ProfilesModule,
    AppointmentsModule,
    SeedModule,
    LogsModule,
    //add cache module from cache manager
    // CacheModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   isGlobal: true,
    //   useFactory: (ConfigService: ConfigService) => {
    //     const redisUrl = ConfigService.getOrThrow<string>('REDIS_URL');
    //     const redisStore = createKeyv(redisUrl);

    //     // Handle Redis connection errors
    //     redisStore.on('error', (err) => {
    //       console.error('❌ Redis connection error:', err);
    //     });

    //     redisStore.on('connect', () => {
    //       console.log('✅ Connected to Redis store');
    //     });
    //     return {
    //       ttl: 60000,
    //       stores: [
    //         new Keyv({
    //           store: new CacheableMemory({
    //             ttl: 30000,
    //             lruSize: 5000,
    //           }),
    //         }),
    //         redisStore,
    //       ],
    //     };
    //   },
    // }),
    AuthModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.getOrThrow<number>('THROTTLE_TTL'), //time to live for throttling
          limit: config.getOrThrow<number>('THROTTLE_LIMIT'), //request limit per id
          ignoreUserAgents: [/^curl\//, /^PostmanRuntime,\//],
        },
      ],
    }),
    MedicalHistoryModule,
    CaslModule,
  ],
  controllers: [],
  providers: [
    // {
    //   provide: 'APP_INTERCEPTOR', // global interceptor
    //   useClass: CacheInterceptor, // global cache interceptor
    // },
    {
      provide: APP_GUARD,
      useClass: AtGuard, //global guard to protect routes
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(
        'profiles',
        'departments',
        'doctors',
        'patients',
        'appointments',
        'medical-history',
      );
  }
}
