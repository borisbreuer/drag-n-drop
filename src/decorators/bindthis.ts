export function BindThis(_: any, __: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const newDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundMethod = originalMethod.bind(this);
            return boundMethod;
        },
    };
    return newDescriptor;
}
