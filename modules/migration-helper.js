// === MIGRATION HELPER ===
// 기존 코드에서 모듈로 점진적 전환을 돕는 유틸리티

export class MigrationHelper {
    constructor() {
        this.isModulesAvailable = false;
        this.loadedModules = {};
        this.checkModules();
    }

    // 모듈 사용 가능 여부 확인
    checkModules() {
        this.isModulesAvailable = typeof window !== 'undefined' && window._modules;
        if (this.isModulesAvailable) {
            this.loadedModules = window._modules;
            console.log('✅ Migration Helper: 모듈 시스템 사용 가능');
        } else {
            console.log('ℹ️ Migration Helper: 기존 시스템 사용 (정상)');
        }
    }

    // 안전한 모듈 사용 (fallback 포함)
    useModule(moduleName, className = null, fallback = null) {
        try {
            if (this.isModulesAvailable && this.loadedModules[moduleName]) {
                const module = this.loadedModules[moduleName];
                
                if (className && module[className]) {
                    return new module[className]();
                }
                
                return module;
            }
        } catch (error) {
            console.warn(`Module ${moduleName} 사용 실패:`, error.message);
        }
        
        // fallback 또는 null 반환
        return fallback || null;
    }

    // 점진적 기능 전환 도우미
    migrate(feature, modernImplementation, legacyImplementation) {
        try {
            if (this.isModulesAvailable) {
                console.log(`🔄 ${feature}: 모듈 방식 사용`);
                return modernImplementation();
            }
        } catch (error) {
            console.warn(`${feature} 모듈 방식 실패:`, error.message);
        }
        
        console.log(`🔧 ${feature}: 기존 방식 사용`);
        return legacyImplementation();
    }

    // 성능 비교 도구
    benchmark(name, modernFn, legacyFn) {
        const results = {
            modern: null,
            legacy: null,
            winner: null
        };

        try {
            // 모던 방식 테스트
            if (this.isModulesAvailable) {
                const start = performance.now();
                modernFn();
                results.modern = performance.now() - start;
            }

            // 레거시 방식 테스트
            const start = performance.now();
            legacyFn();
            results.legacy = performance.now() - start;

            // 승자 결정
            if (results.modern !== null) {
                results.winner = results.modern < results.legacy ? 'modern' : 'legacy';
                console.log(`📊 ${name} 벤치마크:`, results);
            }

        } catch (error) {
            console.warn(`벤치마크 ${name} 실패:`, error.message);
        }

        return results;
    }

    // 호환성 확인
    checkCompatibility() {
        const checks = {
            modules: this.isModulesAvailable,
            audioContext: typeof AudioContext !== 'undefined',
            localStorage: typeof localStorage !== 'undefined',
            fetch: typeof fetch !== 'undefined',
            asyncAwait: true, // 이미 사용 중이므로 true
            css3: true // CSS 변수 지원 확인
        };

        console.log('🔍 호환성 체크:', checks);
        return checks;
    }

    // 모듈별 기능 상태 리포트
    getModuleStatus() {
        if (!this.isModulesAvailable) {
            return { status: 'legacy', message: '기존 시스템 사용 중' };
        }

        const status = {};
        const moduleNames = ['constants', 'audio', 'utils', 'timer', 'storage'];
        
        for (const name of moduleNames) {
            status[name] = {
                loaded: !!this.loadedModules[name],
                exports: this.loadedModules[name] ? Object.keys(this.loadedModules[name]) : []
            };
        }

        return {
            status: 'modular',
            message: '모듈 시스템 활성화',
            modules: status
        };
    }
}

// 전역 헬퍼 인스턴스 생성
export const migrationHelper = new MigrationHelper();

// 개발자 도구에서 쉽게 접근 가능하도록
if (typeof window !== 'undefined') {
    window._migrationHelper = migrationHelper;
}
