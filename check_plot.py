import importlib
libs = ['matplotlib', 'scipy', 'numpy']
for lib in libs:
    try:
        importlib.import_module(lib)
        print(f"{lib} is installed")
    except ImportError:
        print(f"{lib} is NOT installed")
